import type { ConfigOutput } from "../../schemas/configs/config.ts";
import type { VersionFileOutput } from "../../schemas/configs/modules/components/version-file.ts";

export function getPrimaryVersionFile(
  versionFiles: ConfigOutput["versionFiles"],
): VersionFileOutput {
  const primaryFile = versionFiles.find((vf) => vf.primary) ?? versionFiles[0];

  if (!primaryFile) {
    throw new Error("Critical Error: Cannot find primary version file");
  }

  return primaryFile;
}
