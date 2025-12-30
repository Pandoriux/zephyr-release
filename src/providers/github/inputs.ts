import process from "node:process";
import * as core from "@actions/core";
import type { RawInputs } from "../../types/raw-inputs.ts";

export function githubGetRawInputs(): RawInputs {
  return {
    workspacePath: process.env.GITHUB_WORKSPACE,
    token: core.getInput("token", { required: true }),
    configPath: core.getInput("config-path"),
    configFormat: core.getInput("config-format"),
    configOverride: core.getInput("config-override"),
    configOverrideFormat: core.getInput("config-override-format"),
  };
}
