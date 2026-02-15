import { canParse, parse, type SemVer } from "@std/semver";
import type { ConfigOutput } from "../../schemas/configs/config.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import {
  getPrimaryVersionFile,
  getVersionStringFromVersionFile,
} from "../version-file.ts";
import { taskLogger } from "../logger.ts";

type GetPreviousVersionInputsParams = Pick<
  InputsOutput,
  "workspacePath" | "sourceMode"
>;

type GetPreviousVersionConfigParams = Pick<
  ConfigOutput,
  "versionFiles"
>;

export async function getPreviousVersion(
  provider: PlatformProvider,
  inputs: GetPreviousVersionInputsParams,
  config: GetPreviousVersionConfigParams,
): Promise<SemVer | undefined> {
  const { workspacePath, sourceMode } = inputs;
  const { versionFiles } = config;

  taskLogger.info("Getting previous version from primary version files...");
  const primaryVersionFile = getPrimaryVersionFile(versionFiles);
  const primaryVersion = await getVersionStringFromVersionFile(
    primaryVersionFile,
    sourceMode,
    provider,
    workspacePath,
  );

  if (!primaryVersion) {
    return undefined;
  }

  if (!canParse(primaryVersion)) {
    throw new Error(
      `Previous version '${primaryVersion}' is not a valid semver object`,
    );
  }

  return parse(primaryVersion);
}
