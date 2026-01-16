import * as core from "@actions/core";
import {
  toExportEnvVariableKey,
  toExportVariableKey,
} from "../../utils/transformers/case.ts";
import { jsonValueNormalizer } from "../../utils/transformers/json.ts";

export function githubExportVariables(exportObj: Record<string, unknown>) {
  Object.entries(exportObj).forEach(([k, v]) => {
    const stringifiedValue = typeof v === "object" && v !== null
      ? JSON.stringify(v, jsonValueNormalizer)
      : String(v);

    core.setOutput(toExportVariableKey(k), stringifiedValue);
    core.exportVariable(toExportEnvVariableKey(k), stringifiedValue);
  });
}
