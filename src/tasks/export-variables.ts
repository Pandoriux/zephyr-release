import type { OperationContext } from "../types/operation-context.ts";
import type {
  BaseOperationVariables,
  DynamicOperationVariables,
  PostPrepareOperationVariables,
  PrePrepareOperationVariables,
} from "../types/operation-variables.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import {
  toExportEnvVarKey,
  toExportOutputKey,
} from "../utils/transformers/case.ts";
import { jsonValueNormalizer } from "../utils/transformers/json.ts";
import type { WorkingBranchResult } from "./branch.ts";
import type { NextVersionResult } from "./calculate-next-version/next-version.ts";
import type { ResolvedCommit } from "./commit.ts";
import type { ResolveConfigResult } from "./config.ts";
import type { GetInputsResult } from "./inputs.ts";
import { taskLogger } from "./logger.ts";
import { stringifyCurrentPatternContext } from "./string-templates-and-patterns/pattern-context.ts";

export async function exportBaseOperationVariables(
  provider: PlatformProvider,
  options: {
    operationContext: OperationContext;
    workingBranchResult: WorkingBranchResult;
    prForCommit: ProviderPullRequest | undefined;
    prFromBranch: ProviderPullRequest | undefined;
    inputsResult: GetInputsResult;
    configResult: ResolveConfigResult;
  },
) {
  const {
    operationContext,
    workingBranchResult,
    prForCommit,
    prFromBranch,
    inputsResult,
    configResult,
  } = options;
  const { rawInputs, inputs } = inputsResult;
  const { rawConfig, config } = configResult;

  const resolvedTarget = prForCommit ? "release" : "prepare";
  const resolvedJob = resolvedTarget === "release"
    ? "create-release"
    : prFromBranch
    ? "update-pr"
    : "create-pr";

  const { token: _t, sourceMode: _sm, ...excludedInputs } = inputs;

  const prepareExportObject = {
    ...excludedInputs,

    sourceMode: rawInputs.sourceMode ?? "",
    internalSourceMode: JSON.stringify(inputs.sourceMode),

    config: JSON.stringify(rawConfig, jsonValueNormalizer),
    internalConfig: JSON.stringify(config, jsonValueNormalizer),

    parsedTriggerCommit: JSON.stringify(
      operationContext.latestTriggerCommit.commit,
    ),
    parsedTriggerCommitList: JSON.stringify(operationContext.triggerCommits),

    workingBranchName: workingBranchResult.name,
    workingBranchRef: workingBranchResult.ref,
    workingBranchHash: workingBranchResult.object.sha,

    target: resolvedTarget,
    job: resolvedJob,

    pullRequestNumber: resolvedTarget === "prepare"
      ? prFromBranch?.number
      : prForCommit?.number,
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
  resolvedCommitEntries: ResolvedCommit[],
  nextVersionResult: NextVersionResult,
) {
  const prepareExportObject = {
    resolvedCommitEntries: JSON.stringify(resolvedCommitEntries),

    currentVersion: nextVersionResult.currentVerStr,
    nextVersion: nextVersionResult.nextVerStr,

    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PrePrepareOperationVariables
    & Pick<DynamicOperationVariables, "patternContext">;

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

export async function exportPostPrepareOperationVariables(
  provider: PlatformProvider,
  prNumber: number,
  changesData: Map<string, string>,
) {
  const prepareExportObject = {
    committedFilePaths: JSON.stringify([...changesData.keys()]),

    pullRequestNumber: prNumber,
    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PostPrepareOperationVariables
    & DynamicOperationVariables;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Post prepare operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, null, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}
