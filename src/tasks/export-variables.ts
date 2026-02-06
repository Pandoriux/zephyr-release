import type {
  BaseOperationVariables,
  DynamicOperationVariables,
  PrePrepareOperationVariables,
} from "../types/operation-variables.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import {
  toExportEnvVarKey,
  toExportOutputKey,
} from "../utils/transformers/case.ts";
import { jsonValueNormalizer } from "../utils/transformers/json.ts";
import type { WorkingBranchResult } from "./branch.ts";
import type { NextVersionResult } from "./calculate-next-version/next-version.ts";
import type { ResolveConfigResult } from "./config.ts";
import type { GetInputsResult } from "./inputs.ts";
import { taskLogger } from "./logger.ts";
import { stringifyCurrentPatternContext } from "./string-templates-and-patterns/pattern-context.ts";

export async function exportBaseOperationVariables(
  provider: PlatformProvider,
  workingBranchResult: WorkingBranchResult,
  isCommitPr: boolean,
  workingPrExist: boolean,
  inputsResult: GetInputsResult,
  configResult: ResolveConfigResult,
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

    workingBranchName: workingBranchResult.name,
    workingBranchRef: workingBranchResult.ref,
    workingBranchHash: workingBranchResult.object.sha,

    target: resolvedTarget,
    job: resolvedJob,

    patternContext: await stringifyCurrentPatternContext(),
  } satisfies BaseOperationVariables & DynamicOperationVariables;

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

export async function exportPrePrepareOperationVariables(
  provider: PlatformProvider,
  // resolvedCommitsResult: ResolvedCommitsResult, // TODO: accept trigger commit data obj
  nextVersionResult: NextVersionResult,
) {
  const prepareExportObject = {
    // triggerCommit: resolvedCommitsResult.raw, // need raw
    // resolvedCommits: JSON.stringify(resolvedCommitsResult.entries),
    triggerCommit: "to-do",
    resolvedCommits: "to-do",

    currentVersion: nextVersionResult.currentVersionStr,
    nextVersion: nextVersionResult.str,

    patternContext: await stringifyCurrentPatternContext(),
  } satisfies PrePrepareOperationVariables & DynamicOperationVariables;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Pre prepare operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, null, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}
