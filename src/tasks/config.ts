import { deepMerge } from "@std/collections";
import * as v from "@valibot/valibot";
import { type ConfigOutput, ConfigSchema } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/platform-provider.ts";
import { formatValibotIssues } from "../utils/formatters/valibot.ts";
import type { ConfigFileFormatWithAuto } from "../constants/file-formats.ts";
import {
  detectConfigFormatFromPath,
  getConfigFormatTrialOrder,
  parseConfigStringOrThrow,
} from "../utils/parsers/config.ts";
import { logger } from "./logger.ts";

interface ParseConfigResult {
  parsedConfig: unknown;
  resolvedFormat: string;
}

export async function resolveConfigOrThrow(
  provider: PlatformProvider,
  inputs: InputsOutput,
): Promise<ConfigOutput> {
  let configFile: unknown;
  let configOverride: unknown;
  let finalConfig: unknown;

  logger.info("Reading config file from path...");
  if (inputs.configPath) {
    const configText = await provider.getTextFileOrThrow(
      inputs.workspacePath,
      inputs.configPath,
    );

    const parsedResult = parseConfigOrThrow(
      configText,
      inputs.configFormat,
      inputs.configPath,
    );
    configFile = parsedResult.parsedConfig;

    logger.info(
      `Config file parsed successfully (${parsedResult.resolvedFormat})`,
    );
    logger.debugWrap(() => {
      logger.startGroup("Parsed config file:");
      logger.debug(JSON.stringify(configFile, null, 2));
      logger.endGroup();
    });
  } else {
    logger.info("Config path not provided. Skipping...");
  }

  logger.info("Reading config override from inputs...");
  if (inputs.configOverride) {
    const parsedResult = parseConfigOrThrow(
      inputs.configOverride,
      inputs.configOverrideFormat,
    );
    configOverride = parsedResult.parsedConfig;

    logger.info(
      `Config override parsed successfully (${parsedResult.resolvedFormat})`,
    );
    logger.debugWrap(() => {
      logger.startGroup("Parsed config override:");
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
    logger.info("Only config file exist, use config file as final config");
    finalConfig = configFile;
  } else if (configOverride) {
    logger.info(
      "Only config override exist, use config override as final config",
    );
    finalConfig = configOverride;
  } else {
    throw new Error("Both config file and config override are missing");
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
}

function parseConfigOrThrow(
  configStr: string,
  configFormat: ConfigFileFormatWithAuto,
  configPath?: string,
): ParseConfigResult {
  try {
    if (configFormat !== "auto") {
      const parsedConfig = parseConfigStringOrThrow(configStr, configFormat);
      return { parsedConfig, resolvedFormat: configFormat };
    }

    const detectedFormat = detectConfigFormatFromPath(configPath);
    const trialOrder = getConfigFormatTrialOrder(detectedFormat);

    const triedFormats: string[] = [];

    for (const fmt of trialOrder) {
      triedFormats.push(fmt);

      try {
        const parsedConfig = parseConfigStringOrThrow(configStr, fmt);
        const resolvedFormat = `auto -> ${triedFormats.join(" -> ")}`;
        return { parsedConfig, resolvedFormat };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        logger.startGroup(`Parser error (${fmt})`);
        logger.info(message);
        logger.endGroup();
      }
    }

    // None matched
    throw new Error(
      `None formats matched - Tried order: ${triedFormats.join(" -> ")}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to parse configuration (${configFormat}). ${message}`,
    );
  }
}
