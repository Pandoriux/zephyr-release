import { normalize } from "@std/path";
import {
  type Commit,
  type CommitBase,
  CommitParser,
} from "conventional-commits-parser";
import { filterRevertedCommitsSync } from "conventional-commits-filter";
import fg from "fast-glob";
import { taskLogger } from "./logger.ts";
import { prepareVersionFilesToCommit } from "./version-file.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import { NESTED_CLEANING_REGEX, NESTED_COMMIT } from "../constants/commit.ts";
import type { ProviderCommit } from "../types/providers/commit.ts";
import type { ChangelogConfigOutput } from "../schemas/configs/modules/changelog-config.ts";
import { prepareChangelogFileToCommit } from "./changelog.ts";
import { localFilesToCommitOptions } from "../constants/local-files-to-commit-options.ts";
import { execSync } from "node:child_process";
import { getTextFileOrThrow } from "./file.ts";
import { ProviderPullRequest } from "../types/providers/pull-request.ts";

type ResolveCommitsInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash"
>;

type ResolveCommitsConfigParams = Pick<ConfigOutput, "commitTypes">;

export type ResolvedCommit = CommitBase & {
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
  isVirtual: boolean;
  isIgnored: boolean;
}

export interface ResolvedCommitsResult {
  resolvedTriggerCommit: Commit;
  entries: ResolvedCommit[];
}

export async function resolveCommitsFromTriggerToLastRelease(
  provider: PlatformProvider,
  inputs: ResolveCommitsInputsParams,
  config: ResolveCommitsConfigParams,
): Promise<ResolvedCommitsResult> {
  const { triggerCommitHash } = inputs;
  const { commitTypes } = config;

  const rawCommits = await provider.findCommitsFromGivenToPreviousTaggedOrThrow(
    triggerCommitHash,
  );

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup("Raw collected commits:");
    dLogger.info(JSON.stringify(rawCommits, null, 2));
    dLogger.endGroup();
  });

  taskLogger.info("Pre processing raw commits into working entries...");
  const workingEntries = processRawCommits(rawCommits);

  taskLogger.info("Parsing and filtering processed working commit entries...");
  // Options is shallow merged with the library defaults
  const commitParser = new CommitParser(
    provider.getConventionalCommitParserOptions(),
  );

  const allowedTypes = new Set(commitTypes.map((c) => c.type));

  let resolvedTriggerCommit: Commit | undefined;
  const parsedFilteredCommits: ResolvedCommit[] = [];

  for (const entry of workingEntries) {
    const commit = commitParser.parse(entry.message);

    const type = commit.type?.toLowerCase();
    const subject = commit.subject;
    const isTypeAllowed = !!(type && allowedTypes.has(type));

    if (entry.hash === triggerCommitHash && !entry.isVirtual) {
      resolvedTriggerCommit = commit;
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

  if (!resolvedTriggerCommit) {
    throw new Error(
      `Critical Error: Trigger commit ${triggerCommitHash} not found after resolved commit entries`,
    );
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
    resolvedTriggerCommit,
    entries: resolvedCommits,
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
      isVirtual: false,
      isIgnored: overrides.length > 0, // Ignore if user provided an override
    });

    const nestedEntries = overrides.length > 0 ? overrides : appends;
    for (const msg of nestedEntries) {
      workingEntries.push({
        hash: raw.hash,
        message: msg,
        isVirtual: true,
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

type PrepareChangesInputsParams = Pick<
  InputsOutput,
  "workspacePath" | "sourceMode"
>;

type PrepareChangesConfigParams =
  & Pick<
    ConfigOutput,
    "versionFiles" | "localFilesToCommit"
  >
  & {
    changelog: Pick<
      ChangelogConfigOutput,
      | "writeToFile"
      | "path"
      | "fileHeaderTemplate"
      | "fileHeaderTemplatePath"
      | "fileFooterTemplate"
      | "fileFooterTemplatePath"
    >;
  };

export async function prepareChangesToCommit(
  provider: PlatformProvider,
  inputs: PrepareChangesInputsParams,
  config: PrepareChangesConfigParams,
  newData: { changelogRelease: string; nextVersion: string },
): Promise<Map<string, string>> {
  const { workspacePath, sourceMode } = inputs;
  const { versionFiles, localFilesToCommit, changelog } = config;
  const { writeToFile, path } = changelog;
  const { changelogRelease, nextVersion } = newData;

  const changesData = new Map<string, string>();

  taskLogger.info("Collecting channgelog data to commit...");
  if (writeToFile) {
    const clContent = await prepareChangelogFileToCommit(
      provider,
      changelog,
      sourceMode,
      workspacePath,
      changelogRelease,
    );
    changesData.set(normalize(path), clContent);
  } else taskLogger.info("Changelog write to file config is off. Skipping...");

  taskLogger.info(
    `Collecting version files data to commit (${versionFiles.length} files)...`,
  );
  const vfChangesData = await prepareVersionFilesToCommit(
    provider,
    versionFiles,
    sourceMode,
    workspacePath,
    nextVersion,
  );
  for (const [vfPath, vfContent] of vfChangesData) {
    changesData.set(normalize(vfPath), vfContent);
  }

  if (localFilesToCommit) {
    let targetLocalFiles: string[] = [];

    taskLogger.info(
      `Collecting local files data to commit (${localFilesToCommit.length} files)...`,
    );
    if (localFilesToCommit.includes(localFilesToCommitOptions.all)) {
      try {
        const output = execSync("git status --porcelain", {
          cwd: workspacePath,
          encoding: "utf-8",
        });

        targetLocalFiles = output
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => line.slice(3).trim()); // Removes the status code " M "
      } catch (error) {
        throw new Error("Error while executing 'git status --porcelain'", {
          cause: error,
        });
      }
    } else {
      targetLocalFiles = await fg(localFilesToCommit, {
        cwd: workspacePath,
        dot: true, // Users might want to commit .config files
        onlyFiles: true,
        absolute: false, // We want relative paths for the manifest keys
      });
    }

    for (const filePath of targetLocalFiles) {
      const normalizedPath = normalize(filePath);

      // DEDUPLICATION:
      // If "changelog.md" is already in the manifest from step 1,
      // we do NOT overwrite it with the old version from disk.
      if (changesData.has(normalizedPath)) continue;

      const fileContent = await getTextFileOrThrow("local", normalizedPath, {
        workspace: workspacePath,
      });
      changesData.set(normalizedPath, fileContent);
    }
  }

  return changesData;
}

export async function commitChangesToBranch(
  provider: PlatformProvider,
  commitData: {
    triggerCommitHash: string;
    baseTreeHash: string;
    changesToCommit: Map<string, string>;
    message: string;
    workingBranchName: string;
  },
  associatedPrFromBranch: ProviderPullRequest,
) {
  const {
    triggerCommitHash,
    baseTreeHash,
    changesToCommit,
    message,
    workingBranchName,
  } = commitData;

  taskLogger.info("Pushing");
  const createdCommit = await provider.createCommitOnBranchOrThrow(
    triggerCommitHash,
    baseTreeHash,
    changesToCommit,
    message,
    workingBranchName,
  );
}
