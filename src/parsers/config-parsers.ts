import { extname } from "@std/path";
import { JsonObjectNode, JsonParser } from "@croct/json5-parser";
import { parse as parseYaml } from "@eemeli/yaml";
import { parse as parseToml } from "@rainbowatcher/toml-edit-js/index";
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

interface ParseConfigResult {
  parsedConfig: unknown;
  resolvedFormat: string;
}

export function parseConfigOrExit(
  configStr: string,
  configFormat: ConfigFileFormatWithAuto,
  configPath?: string,
): ParseConfigResult {
  try {
    if (configFormat === "auto") {
      return parseConfigAutoOrThrow(configStr, configPath);
    } else {
      return {
        parsedConfig: parseOrThrow(configStr, configFormat),
        resolvedFormat: configFormat,
      };
    }
  } catch (error) {
    exitFailure(`Failed to parse configuration (${configFormat}): ${error}`);
  }
}

function parseConfigAutoOrThrow(
  configStr: string,
  configPath?: string,
): ParseConfigResult {
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
      return {
        parsedConfig: parseOrThrow(configStr, detectedFormat),
        resolvedFormat: `auto -> ${detectedFormat}`,
      };
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
      return {
        parsedConfig: parseOrThrow(configStr, supportedFormats[i]),
        resolvedFormat: `auto -> ${triedFormats.join(" -> ")}`,
      };
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
