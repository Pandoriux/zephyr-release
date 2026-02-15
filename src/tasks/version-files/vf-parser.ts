import { taskLogger } from "../logger.ts";
import type { FileFormat, FileFormatWithAuto } from "../../constants/file-formats.ts";
import { FileFormatMap, FileFormats } from "../../constants/file-formats.ts";
import {
  detectFileFormatFromPath,
  parseFileStringOrThrow,
} from "../../utils/parsers/file.ts";

/**
 * Get trial order for version file format detection
 */
export function getVersionFileFormatTrialOrder(
  detectedFormat?: FileFormat,
  exclude?: FileFormat[],
): FileFormat[] {
  const supportedFormats = Object.values(FileFormats);
  const order = detectedFormat
    ? [
      detectedFormat,
      ...supportedFormats.filter((fmt) => fmt !== detectedFormat),
    ]
    : [...supportedFormats];

  if (!exclude?.length) return order;

  return order.filter((fmt) => !exclude.includes(fmt));
}

interface ParseVersionFileResult {
  parsedContent: unknown;
  resolvedFormatResult: string;
}

/**
 * Parse version file with auto-detection support
 */
export function parseVersionFileOrThrow(
  fileContent: string,
  fileFormat: FileFormatWithAuto,
  filePath: string,
): ParseVersionFileResult {
  try {
    if (fileFormat !== "auto") {
      const parsedContent = parseFileStringOrThrow(fileContent, fileFormat);
      return { parsedContent, resolvedFormatResult: fileFormat };
    }

    const detectedFormat = detectFileFormatFromPath(filePath, FileFormatMap);
    const trialOrder = getVersionFileFormatTrialOrder(detectedFormat);

    const triedFormats: string[] = [];

    for (const fmt of trialOrder) {
      triedFormats.push(fmt);

      try {
        const parsedContent = parseFileStringOrThrow(fileContent, fmt);
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

/**
 * Resolve to a structured version file format (json, jsonc, json5, yaml, toml).
 * txt is never returned; when format is "auto", resolution excludes txt.
 */
export function resolveStructuredVersionFileFormatOrThrow(
  fileContent: string,
  filePath: string,
  format?: FileFormatWithAuto,
): Exclude<FileFormat, "txt"> {
  if (format !== undefined && format !== "auto") {
    if (format === FileFormats.txt) {
      throw new Error(
        `Version file '${filePath}' has format "txt" but structured format (json, jsonc, json5, yaml, toml) is required.`,
      );
    }

    return format;
  }

  const detected = detectFileFormatFromPath(filePath, FileFormatMap);
  const trialOrder = getVersionFileFormatTrialOrder(detected, [FileFormats.txt])
    .filter((fmt) => fmt !== FileFormats.txt);

  for (const fmt of trialOrder) {
    try {
      parseFileStringOrThrow(fileContent, fmt);
      return fmt;
    } catch { /* try next format */ }
  }

  throw new Error(
    `Could not detect structured format for version file '${filePath}'. Tried: ${
      trialOrder.join(", ")
    }`,
  );
}
