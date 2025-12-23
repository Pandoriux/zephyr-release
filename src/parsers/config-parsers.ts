import { extname } from "@std/path";
import { JsonObjectNode, JsonParser } from "@croct/json5-parser";
import { parse as parseYaml } from "@eemeli/yaml";
import { parse as parseToml } from "@rainbowatcher/toml-edit-js";
import type {
  ConfigFileFormat,
  ConfigFileFormatWithAuto,
} from "../constants/file-formats.ts";
import {
  ConfigFileFormatAliasMap,
  ConfigFileFormats,
} from "../constants/file-formats.ts";
import { exitFailure } from "../lifecycle.ts";
import { transformObjKeyToCamelCase } from "../utils/transformers/object.ts";
import { logger } from "../utils/logger.ts";

function parseOrThrow(
  configStr: string,
  configFormat: ConfigFileFormat,
): unknown {
  let parsedConfig: unknown;

  switch (configFormat) {
    case "json":
    case "jsonc":
    case "json5":
      parsedConfig = JsonParser.parse(configStr, JsonObjectNode).toJSON();
      break;

    case "yaml":
      parsedConfig = parseYaml(configStr);
      break;

    case "toml":
      parsedConfig = parseToml(configStr);
      break;
  }

  return transformObjKeyToCamelCase(parsedConfig);
}

export function parseConfig(
  configStr: string,
  configFormat: ConfigFileFormatWithAuto,
  configPath?: string,
): unknown {
  try {
    if (configFormat === "auto") {
      return parseConfigAuto(configStr, configPath);
    } else {
      return parseOrThrow(configStr, configFormat);
    }
  } catch (error) {
    exitFailure(`Failed to parse configuration (${configFormat}): ${error}`);
  }
}

function parseConfigAuto(
  configStr: string,
  configPath?: string,
): unknown {
  const supportedFormats = Object.values(ConfigFileFormats);
  const triedFormats: string[] = [];

  let detectedFormat: ConfigFileFormat | undefined = undefined;

  if (configPath) {
    const ext = extname(configPath).slice(1);
    if (ext) {
      detectedFormat = ConfigFileFormatAliasMap[ext];
    }
  }

  if (detectedFormat) {
    triedFormats.push(detectedFormat);
    try {
      return parseOrThrow(configStr, detectedFormat);
    } catch (error) {
      logger.startGroup(`Parser error (${detectedFormat})`);
      logger.info(String(error));
      logger.endGroup();
    }
  }

  for (let i = 0; i < supportedFormats.length; i++) {
    if (supportedFormats[i] === detectedFormat) continue;

    try {
      triedFormats.push(supportedFormats[i]);
      return parseOrThrow(configStr, supportedFormats[i]);
    } catch (error) {
      logger.startGroup(`Parser error (${supportedFormats[i]})`);
      logger.info(String(error));
      logger.endGroup();
    }
  }

  // The end, none matched
  throw new Error(
    `None formats matched. Tried order: ${triedFormats.join(" -> ")}`,
  );
}
