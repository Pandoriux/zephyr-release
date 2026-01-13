import { type CommitBase, CommitParser } from "conventional-commits-parser";
import { filterRevertedCommitsSync } from "conventional-commits-filter";
import { taskLogger } from "./logger.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import { NESTED_CLEANING_REGEX, NESTED_COMMIT } from "../constants/commit.ts";
import { ProviderCommit } from "../types/providers/commit.ts";

type ResolveCommitsInputsParams = Pick<
  InputsOutput,
  "currentCommitHash" | "token"
>;

type ResolveCommitsConfigParams = Pick<
  ConfigOutput,
  "commitTypes" | "releaseAsIgnoreTypes"
>;

type ResolvedCommit = CommitBase & {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  breaking?: string; // This is the "!" char
  isBreaking: boolean;
};

interface WorkingCommitEntry {
  hash: string;
  message: string;
  isNested: boolean;
  isIgnored: boolean;
}

export interface ResolvedCommitsResult {
  parsedCurrentCommit: CommitBase | undefined;
  commits: ResolvedCommit[];
}

export async function resolveCommitsFromCurrentToLastRelease(
  provider: PlatformProvider,
  inputs: ResolveCommitsInputsParams,
  config: ResolveCommitsConfigParams,
): Promise<ResolvedCommitsResult> {
  const { token, currentCommitHash } = inputs;
  const { commitTypes } = config;

  const rawCommits = await provider
    .findCommitsFromGivenToPreviousTaggedOrThrow(
      token,
      currentCommitHash,
    );

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup("Raw collected commits:");
    dLogger.info(JSON.stringify(rawCommits, null, 2));
    dLogger.endGroup();
  });

  taskLogger.info("Pre processing raw commits into working entries...");
  const workingEntries = processRawCommits(rawCommits);

  taskLogger.info("Parsing and filtering processed working entries...");
  // Options is shallow merged with the library defaults
  const commitParser = new CommitParser(
    provider.getConventionalCommitParserOptions(),
  );

  const allowedTypes = new Set(commitTypes.map((c) => c.type));

  let parsedCurrentCommit: CommitBase | undefined;
  const parsedFilteredCommits: ResolvedCommit[] = [];

  for (const entry of workingEntries) {
    const commit = commitParser.parse(entry.message);

    const type = commit.type?.toLowerCase();
    const subject = commit.subject;
    const isTypeAllowed = !!(type && allowedTypes.has(type));

    if (entry.hash === currentCommitHash && !entry.isNested) {
      if (config.releaseAsIgnoreTypes || isTypeAllowed) {
        parsedCurrentCommit = commit;
      }
    }

    if (entry.isIgnored || !isTypeAllowed || !subject) continue;

    const hasBreakingNote = commit.notes.some(
      (n) => n.title === "BREAKING CHANGE" || n.title === "BREAKING-CHANGE",
    );
    const isBreaking = !!commit.breaking || hasBreakingNote;

    if (isBreaking && !hasBreakingNote) {
      commit.notes.push({ title: "BREAKING CHANGE", text: subject });
    }

    parsedFilteredCommits.push({
      ...commit,
      hash: entry.hash,
      type,
      subject,
      isBreaking,
    });
  }

  const resolvedCommits = Array.from(
    filterRevertedCommitsSync(parsedFilteredCommits),
  );

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup("Final resolved (parsed and filtered) commits:");
    dLogger.info(JSON.stringify(resolvedCommits, null, 2));
    dLogger.endGroup();
  });

  return {
    parsedCurrentCommit,
    commits: resolvedCommits,
  };
}

function processRawCommits(rawCommits: ProviderCommit[]): WorkingCommitEntry[] {
  const workingEntries: WorkingCommitEntry[] = [];

  for (const raw of rawCommits) {
    const cleanedOriginalMessage = cleanMessage(raw.message);
    const overrides = extractBlock(raw.message, NESTED_COMMIT.OVERRIDE);
    const appends = extractBlock(raw.message, NESTED_COMMIT.APPEND);

    workingEntries.push({
      hash: raw.hash,
      message: cleanedOriginalMessage,
      isNested: false,
      isIgnored: overrides.length > 0, // Ignore if user provided an override
    });

    const nestedEntries = overrides.length > 0 ? overrides : appends;
    for (const msg of nestedEntries) {
      workingEntries.push({
        hash: raw.hash,
        message: msg,
        isNested: true,
        isIgnored: false,
      });
    }
  }

  return workingEntries;
}

/**
 * Removes the metadata blocks from the message so the parser
 * doesn't include them in the body/footer.
 */
function cleanMessage(text: string): string {
  return text.replace(NESTED_CLEANING_REGEX, "").trim();
}

function extractBlock(
  text: string,
  block: { start: string; end: string },
): string[] {
  const startIdx = text.indexOf(block.start);
  const endIdx = text.indexOf(block.end);

  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return [];

  return text
    .slice(startIdx + block.start.length, endIdx)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
