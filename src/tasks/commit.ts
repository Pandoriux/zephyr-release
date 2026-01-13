import { type CommitBase, CommitParser } from "conventional-commits-parser";
import { filterRevertedCommitsSync } from "conventional-commits-filter";
import { taskLogger } from "./logger.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";

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

  taskLogger.info(
    "Initializing conventional commit parser, then start parsing and filtering...",
  );
  // Options is shallow merged with the library defaults
  const commitParser = new CommitParser(
    provider.getConventionalCommitParserOptions(),
  );

  const allowedTypes = new Set(commitTypes.map((c) => c.type));

  let parsedCurrentCommit: CommitBase | undefined;
  const parsedFilteredCommits: ResolvedCommit[] = [];

  for (const raw of rawCommits) {
    const commit = commitParser.parse(raw.message);

    const type = commit.type?.toLowerCase();
    const isTypeAllowed = !!(type && allowedTypes.has(type));

    if (raw.hash === currentCommitHash) {
      if (config.releaseAsIgnoreTypes || isTypeAllowed) {
        parsedCurrentCommit = commit;
      }
    }

    const subject = commit.subject;

    if (!isTypeAllowed || !subject) continue;

    const hasBreakingNote = commit.notes.some(
      (n) => n.title === "BREAKING CHANGE" || n.title === "BREAKING-CHANGE",
    );
    const isBreaking = !!commit.breaking || !!hasBreakingNote;

    if (isBreaking && !hasBreakingNote) {
      commit.notes.push({
        title: "BREAKING CHANGE",
        text: subject,
      });
    }

    parsedFilteredCommits.push({
      ...commit,
      hash: raw.hash,
      type,
      subject,
      isBreaking,
    });
  }

  const resolvedCommits = Array.from(
    filterRevertedCommitsSync(parsedFilteredCommits),
  );

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup("Resolved (parsed and filtered) commits:");
    dLogger.info(JSON.stringify(resolvedCommits, null, 2));
    dLogger.endGroup();
  });

  return {
    parsedCurrentCommit,
    commits: resolvedCommits,
  };
}
