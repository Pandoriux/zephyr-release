import { deepMerge } from "@std/collections";
import * as v from "@valibot/valibot";
import { taskLogger } from "./logger.ts";
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

  taskLogger.info("Reading config file from path...");
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

    taskLogger.info(
      `Config file parsed successfully (${parsedResult.resolvedFormat})`,
    );
    taskLogger.debugWrap((dLogger) => {
      dLogger.startGroup("Parsed config file:");
      dLogger.info(JSON.stringify(configFile, null, 2));
      dLogger.endGroup();
    });
  } else {
    taskLogger.info("Config path not provided. Skipping...");
  }

  taskLogger.info("Reading config override from inputs...");
  if (inputs.configOverride) {
    const parsedResult = parseConfigOrThrow(
      inputs.configOverride,
      inputs.configOverrideFormat,
    );
    configOverride = parsedResult.parsedConfig;

    taskLogger.info(
      `Config override parsed successfully (${parsedResult.resolvedFormat})`,
    );
    taskLogger.debugWrap((dLogger) => {
      dLogger.startGroup("Parsed config override:");
      dLogger.info(JSON.stringify(configOverride, null, 2));
      dLogger.endGroup();
    });
  } else {
    taskLogger.info("Config override not provided. Skipping...");
  }

  taskLogger.info("Resolving final config...");
  if (configFile && configOverride) {
    taskLogger.info("Both config file and config override exist, merging...");
    finalConfig = deepMerge(configFile, configOverride, {
      arrays: "replace",
    });
  } else if (configFile) {
    taskLogger.info("Only config file exist, use config file as final config");
    finalConfig = configFile;
  } else if (configOverride) {
    taskLogger.info(
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

  taskLogger.startGroup("Resolved config:");
  taskLogger.info(JSON.stringify(parsedFinalConfigResult.output, null, 2));
  taskLogger.endGroup();

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

        taskLogger.startGroup(`Parser error (${fmt})`);
        taskLogger.info(message);
        taskLogger.endGroup();
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
