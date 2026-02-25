import { extname } from "@std/path";
import { JsonObjectNode, JsonParser } from "@croct/json5-parser";
import { parse as parseYaml } from "@eemeli/yaml";
import { parse as parseToml } from "@rainbowatcher/toml-edit-js/index";
import type { FileFormat } from "../../constants/file-formats.ts";

/**
 * Supported structured file formats: json, jsonc, json5, yaml, toml
 */
export type StructuredFileFormat = Extract<FileFormat, "json" | "jsonc" | "json5" | "yaml" | "toml">;

/**
 * Type guard to check if a file format is structured (not plain txt).
 */
export function isStructuredFileFormat(
  format: FileFormat,
): format is StructuredFileFormat {
  return format !== "txt";
}

/**
 * Format map for detecting file format from extension
 */
export type FileFormatMap<T extends string> = Record<string, T | undefined>;

/**
 * Detect file format from file path extension
 */
export function detectFileFormatFromPath<T extends string>(
  filePath: string | undefined,
  formatMap: FileFormatMap<T>,
): T | undefined {
  if (!filePath) return undefined;

  const ext = extname(filePath).slice(1);
  if (!ext) return undefined;

  return formatMap[ext];
}

/**
 * Parse file content string based on format
 */
export function parseFileStringOrThrow(
  fileContent: string,
  format: StructuredFileFormat,
): object {
  switch (format) {
    case "json":
    case "jsonc":
    case "json5":
      return JsonParser.parse(fileContent, JsonObjectNode).toJSON();

    case "yaml":
      return parseYaml(fileContent);

    case "toml":
      return parseToml(fileContent);
  }
}
