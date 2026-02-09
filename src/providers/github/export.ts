import * as core from "@actions/core";

export function githubExportOutputs(
  k: string,
  v: string | number | null | undefined,
) {
  if (v === null || v === undefined) return;
  core.setOutput(k, String(v));
}

export function githubExportEnvVars(
  k: string,
  v: string | number | null | undefined,
) {
  if (v === null || v === undefined) return;
  core.exportVariable(k, String(v));
}
