import fs from "node:fs";
import path from "node:path";
import { toCamelCase } from "@std/text";
import { deepMerge } from "@std/collections";
import * as core from "@actions/core";
import * as v from "@valibot/valibot";
import { type ConfigOutput, ConfigSchema } from "./schemas/configs/config.ts";

function reviveKeysToCamelCase(_key: string, value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [toCamelCase(k), v]),
    );
  }

  return value;
}

export function resolveConfig(
  workspace: string,
  configPath: string,
  configOverrideStr: string,
): ConfigOutput {
  let configFile: unknown;
  let configOverride: unknown;
  let finalConfig: unknown;

  core.info("Reading config file from config path...");
  if (configPath) {
    const configJson = fs.readFileSync(path.join(workspace, configPath), {
      encoding: "utf8",
    });

    configFile = JSON.parse(configJson, reviveKeysToCamelCase);

    core.info("Config file parsed successfully.");
    if (core.isDebug()) {
      core.startGroup("[DEBUG] Parsed config file:");
      core.debug(JSON.stringify(configFile, null, 2));
      core.endGroup();
    }
  } else {
    core.info("Config path not provided. Skipping...");
  }

  core.info("Reading config override from action input...");
  if (configOverrideStr) {
    configOverride = JSON.parse(configOverrideStr, reviveKeysToCamelCase);

    core.info("Config override parsed successfully.");
    if (core.isDebug()) {
      core.startGroup("[DEBUG] Parsed config override:");
      core.debug(JSON.stringify(configOverride, null, 2));
      core.endGroup();
    }
  } else {
    core.info("Config override not provided. Skipping...");
  }

  core.info("Resolving final config...");
  if (configFile && configOverride) {
    core.info("Both config file and config override exist, merging...");
    finalConfig = deepMerge(configFile, configOverride, { arrays: "replace" });
  } else if (configFile) {
    core.info("Only config file exist, use config file as final config.");
    finalConfig = configFile;
  } else if (configOverride) {
    core.info(
      "Only config override exist, use config override as final config.",
    );
    finalConfig = configOverride;
  } else {
    throw new Error("Both config file and config override are missing.");
  }

  const resolvedConfig = v.parse(ConfigSchema, finalConfig);
  core.startGroup("Resolved config:");
  core.info(JSON.stringify(resolvedConfig, null, 2));
  core.endGroup();

  return resolvedConfig;
}
