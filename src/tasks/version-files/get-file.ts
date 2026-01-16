import type { ConfigOutput } from "../../schemas/configs/config.ts";
import type { VersionFileOutput } from "../../schemas/configs/modules/components/version-file.ts";

export function getPrimaryVersionFile(
  versionFiles: ConfigOutput["versionFiles"],
): VersionFileOutput {
  if (!Array.isArray(versionFiles)) {
    return versionFiles;
  } else {
    const primaryFile = versionFiles.find((vf) => vf.primary);
    if (primaryFile) {
      return primaryFile;
    } else {
      const firstFile = versionFiles[0];
      if (!firstFile) {
        throw new Error("Critical Error: No version files defined");
      }

      return firstFile;
    }
  }
}
