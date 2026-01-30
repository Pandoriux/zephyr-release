import process from "node:process";
import * as core from "@actions/core";
import type { ProviderInputs } from "../../types/providers/inputs.ts";

export function githubGetRawInputs(): ProviderInputs {
  return {
    token: core.getInput("token", { required: true }),

    triggerCommitHash: process.env.GITHUB_SHA,
    triggerBranchName: process.env.GITHUB_REF_NAME,
    workspacePath: process.env.GITHUB_WORKSPACE,

    configPath: core.getInput("config-path"),
    configFormat: core.getInput("config-format"),
    configOverride: core.getInput("config-override"),
    configOverrideFormat: core.getInput("config-override-format"),
    sourceMode: core.getInput("source-mode"),
  };
}
