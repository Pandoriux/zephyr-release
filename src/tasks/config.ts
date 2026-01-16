import { deepMerge } from "@std/collections";
import * as v from "@valibot/valibot";
import { jsonValueNormalizer } from "../utils/transformers/json.ts";
import { taskLogger } from "./logger.ts";
import { type ConfigOutput, ConfigSchema } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { formatValibotIssues } from "../utils/formatters/valibot.ts";
import type { ConfigFileFormatWithAuto } from "../constants/file-formats.ts";
import {
  detectConfigFormatFromPath,
  getConfigFormatTrialOrder,
  parseConfigStringOrThrow,
} from "../utils/parsers/config.ts";

type ResolveConfigInputsParams = Pick<
  InputsOutput,
  | "workspacePath"
  | "configPath"
  | "configFormat"
  | "configOverride"
  | "configOverrideFormat"
>;

interface ParseConfigResult {
  parsedConfig: unknown;
  resolvedFormat: string;
}

export async function resolveConfigOrThrow(
  provider: PlatformProvider,
  inputs: ResolveConfigInputsParams,
): Promise<ConfigOutput> {
  const {
    workspacePath,
    configPath,
    configFormat,
    configOverride,
    configOverrideFormat,
  } = inputs;

  let parsedConfigFile: unknown;
  let parsedConfigOverride: unknown;
  let finalConfig: unknown;

  taskLogger.info("Reading config file from path...");
  if (configPath) {
    const configText = await provider.getTextFileOrThrow(
      workspacePath,
      configPath,
    );

    const parsedResult = parseConfigOrThrow(
      configText,
      configFormat,
      configPath,
    );
    parsedConfigFile = parsedResult.parsedConfig;

    taskLogger.info(
      `Config file parsed successfully (${parsedResult.resolvedFormat})`,
    );
    taskLogger.debugWrap((dLogger) => {
      dLogger.startGroup("Parsed config file:");
      dLogger.info(JSON.stringify(parsedConfigFile, jsonValueNormalizer, 2));
      dLogger.endGroup();
    });
  } else {
    taskLogger.info("Config path not provided. Skipping...");
  }

  taskLogger.info("Reading config override from inputs...");
  if (configOverride) {
    const parsedResult = parseConfigOrThrow(
      configOverride,
      configOverrideFormat,
    );
    parsedConfigOverride = parsedResult.parsedConfig;

    taskLogger.info(
      `Config override parsed successfully (${parsedResult.resolvedFormat})`,
    );
    taskLogger.debugWrap((dLogger) => {
      dLogger.startGroup("Parsed config override:");
      dLogger.info(
        JSON.stringify(parsedConfigOverride, jsonValueNormalizer, 2),
      );
      dLogger.endGroup();
    });
  } else {
    taskLogger.info("Config override not provided. Skipping...");
  }

  taskLogger.info("Resolving final config...");
  if (parsedConfigFile && parsedConfigOverride) {
    taskLogger.info("Both config file and config override exist, merging...");
    finalConfig = deepMerge(parsedConfigFile, parsedConfigOverride, {
      arrays: "replace",
    });
  } else if (parsedConfigFile) {
    taskLogger.info("Only config file exist, use config file as final config");
    finalConfig = parsedConfigFile;
  } else if (parsedConfigOverride) {
    taskLogger.info(
      "Only config override exist, use config override as final config",
    );
    finalConfig = parsedConfigOverride;
  }

  const parsedFinalConfigResult = v.safeParse(ConfigSchema, finalConfig);
  if (!parsedFinalConfigResult.success) {
    throw new Error(
      `\`${resolveConfigOrThrow.name}\` failed!` +
        formatValibotIssues(parsedFinalConfigResult.issues),
    );
  }

  taskLogger.startGroup("Resolved config:");
  taskLogger.info(
    JSON.stringify(parsedFinalConfigResult.output, jsonValueNormalizer, 2),
  );
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
      `None formats matched. Tried order: ${triedFormats.join(" -> ")}`,
    );
  } catch (error) {
    throw new Error(
      `Failed to parse configuration (${configFormat})`,
      { cause: error },
    );
  }
}
