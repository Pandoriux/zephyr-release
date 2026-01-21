import { extname } from "@std/path";
import { JsonObjectNode, JsonParser } from "@croct/json5-parser";
import { parse as parseYaml } from "@eemeli/yaml";
import { parse as parseToml } from "@rainbowatcher/toml-edit-js/index";
import type { FileFormat } from "../../constants/file-formats.ts";
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
): FileFormat[] {
  const supportedFormats = Object.values(FileFormats);

  if (!detectedFormat) return supportedFormats;

  return [
    detectedFormat,
    ...supportedFormats.filter((fmt) => fmt !== detectedFormat),
  ];
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
