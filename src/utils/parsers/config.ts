import { extname } from "@std/path";
import { JsonObjectNode, JsonParser } from "@croct/json5-parser";
import { parse as parseYaml } from "@eemeli/yaml";
import { parse as parseToml } from "@rainbowatcher/toml-edit-js/index";
import type { ConfigFileFormat } from "../../constants/file-formats.ts";
import {
  ConfigFileFormatMap,
  ConfigFileFormats,
} from "../../constants/file-formats.ts";

export function detectConfigFormatFromPath(
  configPath?: string,
): ConfigFileFormat | undefined {
  if (!configPath) return undefined;

  const ext = extname(configPath).slice(1);
  if (!ext) return undefined;

  return ConfigFileFormatMap[ext];
}

export function getConfigFormatTrialOrder(
  detectedFormat?: ConfigFileFormat,
): ConfigFileFormat[] {
  const supportedFormats = Object.values(ConfigFileFormats);

  if (!detectedFormat) return supportedFormats;

  return [
    detectedFormat,
    ...supportedFormats.filter((fmt) => fmt !== detectedFormat),
  ];
}

export function parseConfigStringOrThrow(
  configStr: string,
  configFormat: ConfigFileFormat,
): unknown {
  switch (configFormat) {
    case "json":
    case "jsonc":
    case "json5":
      return JsonParser.parse(configStr, JsonObjectNode).toJSON();

    case "yaml":
      return parseYaml(configStr);

    case "toml":
      return parseToml(configStr);
  }
}
