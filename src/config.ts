import fs from "node:fs";
import path from "node:path";
import { deepMerge } from "@std/collections";
import * as core from "@actions/core";
import * as v from "@valibot/valibot";
import {
  ConfigSchema,
  ParseJsonConfigSchema,
} from "./schemas/configs/config.ts";

export function resolveConfig(
  workspace: string,
  configPath: string,
  configInlineJson: string,
) {
  let configFile: unknown;
  let configInline: unknown;
  let finalConfig: unknown;

  if (configPath) {
    core.info("Reading config file from config path...");

    const configJson = fs.readFileSync(path.join(workspace, configPath), {
      encoding: "utf8",
    });

    configFile = v.parse(ParseJsonConfigSchema, configJson);

    core.info("Config parsed successfully.");
    core.debug(JSON.stringify(configFile, null, 2));
  }

  if (configInlineJson) {
    core.info("Reading config override from action input...");

    configInline = v.parse(ParseJsonConfigSchema, configInlineJson);

    core.info("Config override parsed successfully.");
    core.debug(JSON.stringify(configInline, null, 2));
  }

  core.info("Resolving final config...");

  if (configFile && configInline) {
    core.info("Both config file and config inline exist, merging...");
    finalConfig = deepMerge(configFile, configInline, { arrays: "replace" });
  } else if (configFile) {
    core.info(`Only config file exist, use config file as final config.`);
    finalConfig = configFile;
  } else if (configInline) {
    core.info(`Only config inline exist, use config inline as final config.`);
    finalConfig = configInline;
  } else {
    throw new Error("Both config file and config inline are not resolvable.");
  }

  return v.parse(ConfigSchema, finalConfig);
}
