import { canParse, format, parse, type SemVer } from "@std/semver";
import type { Commit } from "conventional-commits-parser";
import {
  getPrimaryVersionFile,
  getVersionStringFromVersionFile,
} from "../version-file.ts";
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
  | "versionFiles"
  | "commitTypes"
  | "allowReleaseAs"
  | "bumpStrategy"
>;

export interface NextVersionResult {
  str: string;
  semver: SemVer;
  currentVersionStr: string;
}

export async function calculateNextVersion(
  provider: PlatformProvider,
  resolvedCommitsResult: ResolvedCommitsResult,
  inputs: CalculateNextVersionInputsParams,
  config: CalculateNextVersionConfigParams,
): Promise<NextVersionResult> {
  const { resolvedTriggerCommit, entries } = resolvedCommitsResult;
  const { workspacePath, sourceMode } = inputs;
  const {
    timeZone,
    initialVersion,
    versionFiles,
    commitTypes,
    allowReleaseAs,
    bumpStrategy,
  } = config;

  taskLogger.info("Getting current version from primary version files...");
  const primaryVersionFile = getPrimaryVersionFile(versionFiles);
  const primaryVersion = await getVersionStringFromVersionFile(
    primaryVersionFile,
    sourceMode,
    provider,
    workspacePath,
  );

  const currentVersion = primaryVersion ? primaryVersion : initialVersion;
  if (!canParse(currentVersion)) {
    throw new Error(
      `Current version '${currentVersion}' from is not a valid semver object`,
    );
  }

  taskLogger.info("Checking if there is release-as trigger...");
  const manualReleaseAsVersion = resolveManualReleaseAsVersion(
    currentVersion,
    resolvedTriggerCommit,
    commitTypes,
    allowReleaseAs,
  );
  if (manualReleaseAsVersion) {
    return manualReleaseAsVersion;
  }

  taskLogger.info(`Current version got from version file is ${currentVersion}`);
  const currentSemVer = parse(currentVersion);

  const nextCoreSemVer = calculateNextCoreSemVer(
    currentSemVer,
    entries,
    bumpStrategy,
  );

  const nextExtensionSemVer = calculateNextExtensionsSemVer(
    currentSemVer,
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

  return {
    str: finalVersion,
    semver: finalSemVer,
    currentVersionStr: currentVersion,
  };
}

function resolveManualReleaseAsVersion(
  currentVersionStr: string,
  triggerCommit: Commit,
  commitTypes: CalculateNextVersionConfigParams["commitTypes"],
  allowReleaseAs: CalculateNextVersionConfigParams["allowReleaseAs"],
): NextVersionResult | undefined {
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

  const semver = parse(releaseAsNote.text);

  return {
    str: format(semver),
    semver,
    currentVersionStr,
  };
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
