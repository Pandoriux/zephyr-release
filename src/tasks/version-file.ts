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
  resolveStructuredVersionFileFormatOrThrow,
} from "../utils/parsers/version-file.ts";
import {
  detectVersionFileExtractor,
  extractVersionStringOrThrow,
} from "../utils/extractors/version-file.ts";
import { updateVersionInStructuredFile } from "../utils/transformers/version-file.ts";
import { parseRegExpFromSelector } from "../utils/parsers/regex.ts";

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
  workspacePath: string,
): Promise<string | null | undefined> {
  const fileSourceMode = getVersionFileSourceMode(
    versionFile.path,
    sourceMode,
  );

  const fileContent = await getTextFileOrThrow(
    fileSourceMode,
    versionFile.path,
    { workspace: workspacePath, provider },
  );

  const parsedResult = parseVersionFileOrThrow(
    fileContent,
    versionFile.format,
    versionFile.path,
  );
  taskLogger.info(
    `Version file parsed successfully (${parsedResult.resolvedFormatResult})`,
  );

  const extractor = versionFile.extractor === "auto"
    ? detectVersionFileExtractor(versionFile.selector)
    : versionFile.extractor;
  if (!extractor) {
    throw new Error(
      `Unable to determine a version file extractor for selector '${versionFile.selector}'`,
    );
  }

  return extractVersionStringOrThrow(
    parsedResult.parsedContent,
    extractor,
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

export async function prepareVersionFilesToCommit(
  provider: PlatformProvider,
  versionFiles: ConfigOutput["versionFiles"],
  sourceMode: InputsOutput["sourceMode"],
  workspacePath: string,
  nextVersion: string,
): Promise<[string, string][]> {
  const vfChangesData: [string, string][] = [];

  for (const vf of versionFiles) {
    const fileContent = await getTextFileOrThrow(
      getVersionFileSourceMode(vf.path, sourceMode),
      vf.path,
      {
        provider,
        workspace: workspacePath,
      },
    );

    const extractor = vf.extractor === "auto"
      ? detectVersionFileExtractor(vf.selector)
      : vf.extractor;

    if (!extractor) {
      throw new Error(
        `Unable to determine extractor for version file '${vf.path}' (selector: ${vf.selector})`,
      );
    }

    switch (extractor) {
      case "json-path": {
        const resolvedFormat = resolveStructuredVersionFileFormatOrThrow(
          fileContent,
          vf.path,
          vf.format,
        );

        const newContent = updateVersionInStructuredFile(
          fileContent,
          resolvedFormat,
          vf.selector,
          nextVersion,
        );

        vfChangesData.push([vf.path, newContent]);
        break;
      }

      case "regex": {
        const regex = parseRegExpFromSelector(vf.selector);

        const newContent = fileContent.replace(regex, (match, ...groups) => {
          const firstGroup = groups[0];
          if (firstGroup !== undefined) {
            return match.replace(firstGroup, nextVersion);
          }

          return nextVersion;
        });

        vfChangesData.push([vf.path, newContent]);
        break;
      }
    }
  }

  return vfChangesData;
}
