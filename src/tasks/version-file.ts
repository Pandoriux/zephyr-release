import { taskLogger } from "./logger.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { VersionFileOutput } from "../schemas/configs/modules/components/version-file.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { SourceModeOption } from "../constants/source-mode-options.ts";
import { getTextFileOrThrow } from "./file.ts";
import type { FileFormatWithAuto } from "../constants/file-formats.ts";
import {
  detectVersionFileFormatFromPath,
  getVersionFileFormatTrialOrder,
  parseVersionFileStringOrThrow,
} from "../utils/parsers/version-file.ts";
import { extractVersionStringOrThrow } from "../utils/extractors/version-file.ts";

function getVersionFileSourceMode(
  filePath: string,
  sourceMode: InputsOutput["sourceMode"],
): SourceModeOption {
  const baseMode = sourceMode.sourceMode;

  if (!sourceMode.versionFiles) {
    return baseMode;
  }

  if (typeof sourceMode.versionFiles === "string") {
    return sourceMode.versionFiles;
  }

  const fileSpecificMode = sourceMode.versionFiles[filePath];
  if (fileSpecificMode) {
    return fileSpecificMode;
  }

  return baseMode;
}

export function getPrimaryVersionFile(
  versionFiles: ConfigOutput["versionFiles"],
): VersionFileOutput {
  const primaryFile = versionFiles.find((vf) => vf.primary) ?? versionFiles[0];

  if (!primaryFile) {
    throw new Error("Critical Error: Cannot find primary version file");
  }

  taskLogger.info(
    "Found current primary version file: " +
      JSON.stringify(primaryFile, null, 2),
  );

  return primaryFile;
}

export async function getVersionStringFromVersionFile(
  versionFile: VersionFileOutput,
  sourceMode: InputsOutput["sourceMode"],
  provider: PlatformProvider,
  token: string,
  workspacePath: string,
): Promise<string | undefined> {
  const fileSourceMode = getVersionFileSourceMode(
    versionFile.path,
    sourceMode,
  );

  const fileContent = await getTextFileOrThrow({
    source: fileSourceMode,
    workspace: workspacePath,
    path: versionFile.path,
    provider,
    token,
  });

  const parsedResult = parseVersionFileOrThrow(
    fileContent,
    versionFile.format,
    versionFile.path,
  );
  taskLogger.info(
    `Version file parsed successfully (${parsedResult.resolvedFormatResult})`,
  );

  return extractVersionStringOrThrow(
    parsedResult.parsedContent,
    versionFile.extractor,
    versionFile.selector,
  );
}

interface ParseVersionFileResult {
  parsedContent: unknown;
  resolvedFormatResult: string;
}

function parseVersionFileOrThrow(
  fileContent: string,
  fileFormat: FileFormatWithAuto,
  filePath: string,
): ParseVersionFileResult {
  try {
    if (fileFormat !== "auto") {
      const parsedContent = parseVersionFileStringOrThrow(
        fileContent,
        fileFormat,
      );
      return { parsedContent, resolvedFormatResult: fileFormat };
    }

    const detectedFormat = detectVersionFileFormatFromPath(filePath);
    const trialOrder = getVersionFileFormatTrialOrder(detectedFormat);

    const triedFormats: string[] = [];

    for (const fmt of trialOrder) {
      triedFormats.push(fmt);

      try {
        const parsedContent = parseVersionFileStringOrThrow(fileContent, fmt);
        const resolvedFormat = `auto -> ${triedFormats.join(" -> ")}`;
        return { parsedContent, resolvedFormatResult: resolvedFormat };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        taskLogger.debugWrap((dLogger) => {
          dLogger.startGroup(`Parser error (${fmt})`);
          dLogger.info(message);
          dLogger.endGroup();
        });
      }
    }

    // None matched
    throw new Error(
      `None formats matched. Tried order: ${triedFormats.join(" -> ")}`,
    );
  } catch (error) {
    throw new Error(
      `Failed to parse version file (${fileFormat})`,
      { cause: error },
    );
  }
}
