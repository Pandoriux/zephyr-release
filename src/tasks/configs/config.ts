import { deepMerge } from "@std/collections";
import * as v from "@valibot/valibot";
import { taskLogger } from "../logger.ts";
import { getTextFileOrThrow } from "../file.ts";
import { jsonValueNormalizer } from "../../utils/transformers/json.ts";
import {
  type ConfigOutput,
  ConfigSchema,
} from "../../schemas/configs/config.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import { formatValibotIssues } from "../../utils/formatters/valibot.ts";
import { parseConfigOrThrow } from "./config-parser.ts";
import { transformObjKeyToCamelCase } from "../../utils/transformers/object.ts";

type ResolveConfigInputsParams = Pick<
  InputsOutput,
  | "triggerCommitHash"
  | "configPath"
  | "configFormat"
  | "configOverride"
  | "configOverrideFormat"
>;

export interface ResolveConfigResult {
  rawConfig: unknown;
  config: ConfigOutput;
}

export async function resolveConfigOrThrow(
  provider: PlatformProvider,
  inputs: ResolveConfigInputsParams,
): Promise<ResolveConfigResult> {
  const {
    triggerCommitHash,
    configPath,
    configFormat,
    configOverride,
    configOverrideFormat,
  } = inputs;

  let parsedConfigFile: unknown;
  let parsedConfigOverride: unknown;
  let rawFinalConfig: unknown;

  taskLogger.info("Reading config file from path...");
  if (configPath) {
    const configText = await getTextFileOrThrow("remote", configPath, {
      provider,
      ref: triggerCommitHash,
    });

    const parsedResult = parseConfigOrThrow(
      configText,
      configFormat,
      configPath,
    );
    parsedConfigFile = parsedResult.parsedConfig;

    taskLogger.info(
      `Config file parsed successfully (${parsedResult.resolvedFormatResult})`,
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
      `Config override parsed successfully (${parsedResult.resolvedFormatResult})`,
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
    rawFinalConfig = deepMerge(parsedConfigFile, parsedConfigOverride, {
      arrays: "replace",
    });
  } else if (parsedConfigFile) {
    taskLogger.info("Only config file exist, use config file as final config");
    rawFinalConfig = parsedConfigFile;
  } else if (parsedConfigOverride) {
    taskLogger.info(
      "Only config override exist, use config override as final config",
    );
    rawFinalConfig = parsedConfigOverride;
  } else {
    throw new Error(
      "No config provided: neither config file nor override was found",
    );
  }

  const parsedFinalConfigResult = v.safeParse(
    ConfigSchema,
    transformObjKeyToCamelCase(rawFinalConfig),
  );
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

  return { rawConfig: rawFinalConfig, config: parsedFinalConfigResult.output };
}
