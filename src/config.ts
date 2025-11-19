import fs from "node:fs";
import path from "node:path";
import { deepMerge } from "@std/collections";
import core from "@actions/core";
import * as v from "@valibot/valibot";
import {
  type ConfigOutput,
  ConfigSchema,
  ParseJsonConfigSchema,
} from "./schemas/configs/config.ts";

export function resolveConfig(
  workspace: string,
  configPath: string,
  configInlineJson: string,
) {
  let configFile: ConfigOutput | undefined;
  let configInline: ConfigOutput | undefined;
  let finalConfig: ConfigOutput;

  if (configPath) {
    core.info("Reading config json from config path...");

    const configJson = fs.readFileSync(path.join(workspace, configPath), {
      encoding: "utf8",
    });

    configFile = v.parse(ParseJsonConfigSchema, configJson);

    core.info("Config parsed successfully from config json path.");
    core.debug(JSON.stringify(configFile, null, 2));
  }

  if (configInlineJson) {
    core.info("Reading config json from config inline...");

    configInline = v.parse(ParseJsonConfigSchema, configInlineJson);

    core.info("Config parsed successfully from config inline.");
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
