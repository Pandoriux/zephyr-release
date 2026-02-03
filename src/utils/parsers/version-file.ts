import { extname } from "@std/path";
import { JsonObjectNode, JsonParser } from "@croct/json5-parser";
import { parse as parseYaml } from "@eemeli/yaml";
import { parse as parseToml } from "@rainbowatcher/toml-edit-js/index";
import type {
  FileFormat,
  FileFormatWithAuto,
} from "../../constants/file-formats.ts";
import { FileFormatMap, FileFormats } from "../../constants/file-formats.ts";

export function detectVersionFileFormatFromPath(
  filePath: string,
): FileFormat | undefined {
  const ext = extname(filePath).slice(1);
  if (!ext) return undefined;

  return FileFormatMap[ext];
}

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

export function parseVersionFileStringOrThrow(
  fileContent: string,
  fileFormat: FileFormat,
): unknown {
  switch (fileFormat) {
    case "json":
    case "jsonc":
    case "json5":
      return JsonParser.parse(fileContent, JsonObjectNode).toJSON();

    case "yaml":
      return parseYaml(fileContent);

    case "toml":
      return parseToml(fileContent);

    case "txt":
      return fileContent;
  }
}

/**
 * Resolve to a structured version file format (json, jsonc, json5, yaml, toml).
 * txt is never returned; when format is "auto", resolution excludes txt.
 * @param format When provided and not "auto" / "txt", returns it; when "txt", throws.
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

  const detected = detectVersionFileFormatFromPath(filePath);
  const trialOrder = getVersionFileFormatTrialOrder(detected, [FileFormats.txt])
    .filter((fmt) => fmt !== FileFormats.txt);

  for (const fmt of trialOrder) {
    try {
      parseVersionFileStringOrThrow(fileContent, fmt);
      return fmt;
    } catch { /* try next format */ }
  }

  throw new Error(
    `Could not detect structured format for version file '${filePath}'. Tried: ${
      trialOrder.join(", ")
    }`,
  );
}
