import fs from "node:fs";
import path from "node:path";
import { deepMerge } from "@std/collections";
import * as v from "@valibot/valibot";
import { type ConfigOutput, ConfigSchema } from "../schemas/configs/config.ts";
import type { ConfigFileFormatWithAuto } from "../constants/file-formats.ts";
import { parseConfig } from "../parsers/config-parsers.ts";
import { logger } from "../utils/logger.ts";

export function resolveConfig(
  workspace: string,
  configPath: string,
  configFormat: ConfigFileFormatWithAuto,
  configOverrideStr: string,
  configOverrideFormat: ConfigFileFormatWithAuto,
): ConfigOutput {
  let configFile: unknown;
  let configOverride: unknown;
  let finalConfig: unknown;

  logger.info("Reading config file from config path...");
  if (configPath) {
    const configJson = fs.readFileSync(path.join(workspace, configPath), {
      encoding: "utf8",
    });

    configFile = parseConfig(configJson, configFormat, configPath);

    logger.info("Config file parsed successfully.");
    logger.debugWrap(() => {
      logger.startGroup("[DEBUG] Parsed config file:");
      logger.debug(JSON.stringify(configFile, null, 2));
      logger.endGroup();
    });
  } else {
    logger.info("Config path not provided. Skipping...");
  }

  logger.info("Reading config override from action input...");
  if (configOverrideStr) {
    configOverride = parseConfig(configOverrideStr, configOverrideFormat);

    logger.info("Config override parsed successfully.");
    logger.debugWrap(() => {
      logger.startGroup("[DEBUG] Parsed config override:");
      logger.debug(JSON.stringify(configOverride, null, 2));
      logger.endGroup();
    });
  } else {
    logger.info("Config override not provided. Skipping...");
  }

  logger.info("Resolving final config...");
  if (configFile && configOverride) {
    logger.info("Both config file and config override exist, merging...");
    finalConfig = deepMerge(configFile, configOverride, { arrays: "replace" });
  } else if (configFile) {
    logger.info("Only config file exist, use config file as final config.");
    finalConfig = configFile;
  } else if (configOverride) {
    logger.info(
      "Only config override exist, use config override as final config.",
    );
    finalConfig = configOverride;
  } else {
    throw new Error("Both config file and config override are missing.");
  }

  const resolvedConfig = v.parse(ConfigSchema, finalConfig);
  logger.startGroup("Resolved config:");
  logger.info(JSON.stringify(resolvedConfig, null, 2));
  logger.endGroup();

  return resolvedConfig;
}
