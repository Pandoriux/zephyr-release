import type { BaseOperationVariables } from "../types/operation-variables.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import {
  toExportEnvVarKey,
  toExportOutputKey,
} from "../utils/transformers/case.ts";
import { jsonValueNormalizer } from "../utils/transformers/json.ts";
import type { ResolveConfigResult } from "./config.ts";
import type { GetInputsResult } from "./inputs.ts";
import { taskLogger } from "./logger.ts";
import { stringifyCurrentPatternContext } from "./string-templates-and-patterns/pattern-context.ts";

export async function exportBaseOperationVariables(
  provider: PlatformProvider,
  inputsResult: GetInputsResult,
  configResult: ResolveConfigResult,
  isCommitPr: boolean,
  workingPrExist: boolean,
) {
  const { rawInputs, inputs } = inputsResult;
  const { rawConfig, config } = configResult;

  const resolvedTarget = isCommitPr ? "release" : "prepare";
  const resolvedJob = resolvedTarget === "release"
    ? "create-release"
    : workingPrExist
    ? "update-pr"
    : "create-pr";

  const { token: _t, sourceMode: _sm, ...excludedInputs } = inputs;

  const prepareExportObject = {
    ...excludedInputs,

    sourceMode: rawInputs.sourceMode ?? "",
    internalSourceMode: JSON.stringify(inputs.sourceMode),

    config: JSON.stringify(rawConfig, jsonValueNormalizer),
    internalConfig: JSON.stringify(config, jsonValueNormalizer),

    patternContext: await stringifyCurrentPatternContext(),

    target: resolvedTarget,
    job: resolvedJob,
  } satisfies BaseOperationVariables;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Base operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, jsonValueNormalizer, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}

export function exportPrePrepareOperationVariables(
  _provider: PlatformProvider,
) {}
