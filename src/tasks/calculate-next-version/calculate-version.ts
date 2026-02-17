import { canParse, format, parse, type SemVer } from "@std/semver";
import type { Commit } from "conventional-commits-parser";
import type { ResolvedCommitsResult } from "../commit.ts";
import { taskLogger } from "../logger.ts";
import type { ConfigOutput } from "../../schemas/configs/config.ts";
import { AllowReleaseAsOptions } from "../../constants/release-as-options.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";
import { calculateNextCoreSemVer } from "./core-calculations.ts";
import { calculateNextExtensionsSemVer } from "./extension-calculations.ts";

type CalculateNextVersionInputsParams = Pick<
  InputsOutput,
  "workspacePath" | "sourceMode"
>;

type CalculateNextVersionConfigParams = Pick<
  ConfigOutput,
  | "timeZone"
  | "initialVersion"
  | "commitTypes"
  | "allowReleaseAs"
  | "bumpStrategy"
>;

export function calculateNextVersion(
  resolvedCommitsResult: ResolvedCommitsResult,
  config: CalculateNextVersionConfigParams,
  previousVersion: SemVer | undefined,
): SemVer {
  const { resolvedTriggerCommit, entries } = resolvedCommitsResult;
  const {
    timeZone,
    initialVersion,
    commitTypes,
    allowReleaseAs,
    bumpStrategy,
  } = config;

  taskLogger.info(
    "Checking if there is release-as trigger (manual version set)...",
  );
  const manualReleaseAsVersion = resolveManualReleaseAsVersion(
    resolvedTriggerCommit,
    commitTypes,
    allowReleaseAs,
  );
  if (manualReleaseAsVersion) {
    return manualReleaseAsVersion;
  }

  // No previous version, return initial version
  if (!previousVersion) {
    taskLogger.info(
      `No previous version found, using initial version: ${initialVersion}`,
    );

    if (!canParse(initialVersion)) {
      throw new Error(
        `Initial version '${initialVersion}' is not a valid semver object`,
      );
    }

    return parse(initialVersion);
  }

  // Previous version exists, calculate the next version
  taskLogger.info(
    `Previous version got from version file is ${previousVersion}`,
  );

  // Calculate next version from previous version
  const nextCoreSemVer = calculateNextCoreSemVer(
    previousVersion,
    entries,
    bumpStrategy,
  );

  const nextExtensionSemVer = calculateNextExtensionsSemVer(
    previousVersion,
    nextCoreSemVer,
    bumpStrategy,
    timeZone,
  );

  const finalSemVer: SemVer = {
    major: nextCoreSemVer.major,
    minor: nextCoreSemVer.minor,
    patch: nextCoreSemVer.patch,
    prerelease: nextExtensionSemVer.prerelease,
    build: nextExtensionSemVer.build,
  };
  const finalVersion = format(finalSemVer);
  taskLogger.info(`Final calculated next version: ${finalVersion}`);

  return finalSemVer;
}

function resolveManualReleaseAsVersion(
  triggerCommit: Commit,
  commitTypes: CalculateNextVersionConfigParams["commitTypes"],
  allowReleaseAs: CalculateNextVersionConfigParams["allowReleaseAs"],
): SemVer | undefined {
  const releaseAsNote = triggerCommit.notes.find((n) =>
    n.title.toLowerCase() === "release as" ||
    n.title.toLowerCase() === "release-as"
  );
  if (!releaseAsNote) return undefined;

  const isAllowed = isReleaseAsAllowed(
    triggerCommit.type,
    allowReleaseAs,
    commitTypes,
  );
  if (!isAllowed) {
    taskLogger.info(
      `Found release-as footer but commit type '${triggerCommit.type}' is not allowed to trigger 'release-as'`,
    );

    return undefined;
  }

  if (!canParse(releaseAsNote.text)) {
    return undefined;
  }

  return parse(releaseAsNote.text);
}

/**
 * Validates if a specific commit type matches the 'allowReleaseAs' policy.
 */
function isReleaseAsAllowed(
  type: string | null | undefined,
  allowReleaseAs: CalculateNextVersionConfigParams["allowReleaseAs"],
  commitTypes: CalculateNextVersionConfigParams["commitTypes"],
): boolean {
  if (allowReleaseAs.includes(AllowReleaseAsOptions.all)) return true;

  if (!type) return false;

  const currentType = type.toLowerCase();

  if (allowReleaseAs.includes(currentType)) return true;

  if (allowReleaseAs.includes(AllowReleaseAsOptions.base)) {
    return commitTypes.some((ct) => ct.type === currentType);
  }

  return false;
}
