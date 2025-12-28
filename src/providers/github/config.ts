import fs from "node:fs";
import path from "node:path";
import { deepMerge } from "@std/collections";
import * as v from "@valibot/valibot";
import {
  type ConfigOutput,
  ConfigSchema,
} from "../../schemas/configs/config.ts";
import type { ConfigFileFormatWithAuto } from "../../constants/file-formats.ts";
import { parseConfigOrExit } from "../../utils/parsers/config-parsers.ts";
import { formatValibotIssues } from "../../utils/formatters/valibot.ts";
import { logger } from "../../tasks/logger.ts";
import { ZephyrReleaseError } from "../../errors/zephyr-release-error.ts";

export function githubResolveConfigOrThrow(
  workspacePath: string,
  configPath: string,
  configFormat: ConfigFileFormatWithAuto,
  configOverrideStr: string,
  configOverrideFormat: ConfigFileFormatWithAuto,
): ConfigOutput {
  try {
    let configFile: unknown;
    let configOverride: unknown;
    let finalConfig: unknown;

    logger.info("Reading config file from config path...");
    if (configPath) {
      const configJson = fs.readFileSync(path.join(workspacePath, configPath), {
        encoding: "utf8",
      });

      const parsedResult = parseConfigOrExit(
        configJson,
        configFormat,
        configPath,
      );
      configFile = parsedResult.parsedConfig;

      logger.info(
        `Config file parsed successfully (${parsedResult.resolvedFormat}).`,
      );
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
      const parsedResult = parseConfigOrExit(
        configOverrideStr,
        configOverrideFormat,
      );
      configOverride = parsedResult.parsedConfig;

      logger.info(
        `Config override parsed successfully (${parsedResult.resolvedFormat}).`,
      );
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
      finalConfig = deepMerge(configFile, configOverride, {
        arrays: "replace",
      });
    } else if (configFile) {
      logger.info("Only config file exist, use config file as final config.");
      finalConfig = configFile;
    } else if (configOverride) {
      logger.info(
        "Only config override exist, use config override as final config.",
      );
      finalConfig = configOverride;
    } else {
      throw new Error(
        "Both config file and config override are missing.",
      );
    }

    const parsedFinalConfigResult = v.safeParse(ConfigSchema, finalConfig);
    if (!parsedFinalConfigResult.success) {
      throw new Error(
        formatValibotIssues(parsedFinalConfigResult.issues),
      );
    }

    logger.startGroup("Resolved config:");
    logger.info(JSON.stringify(parsedFinalConfigResult.output, null, 2));
    logger.endGroup();

    return parsedFinalConfigResult.output;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ZephyrReleaseError(
      `\`${githubResolveConfigOrThrow.name}\`: ${message}`,
    );
  }
}
