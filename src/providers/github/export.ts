import * as core from "@actions/core";

export function githubExportOutputs(k: string, v: string) {
  core.setOutput(k, v);
}

export function githubExportEnvVars(k: string, v: string) {
  core.exportVariable(k, v);
}
