import * as core from "@actions/core";
import {
  toExportEnvVariableKey,
  toExportVariableKey,
} from "../../utils/transformers/case.ts";

export function githubExportVariables(exportObj: Record<string, string>) {
  Object.entries(exportObj).forEach(([k, v]) => {
    core.setOutput(toExportVariableKey(k), v);
    core.exportVariable(toExportEnvVariableKey(k), v);
  });
}
