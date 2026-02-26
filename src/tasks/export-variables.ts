import type { OperationTriggerContext } from "../types/operation-context.ts";
import type {
  BaseOperationVariables,
  DynamicOperationVariables,
  PostProposeOperationVariables,
  PostReleaseOperationVariables,
  PreProposeOperationVariables,
  PreReleaseOperationVariables,
} from "../types/operation-variables.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import {
  toExportEnvVarKey,
  toExportOutputKey,
} from "../utils/transformers/case.ts";
import { jsonValueNormalizer } from "../utils/transformers/json.ts";
import { format, type SemVer } from "@std/semver";
import type { WorkingBranchResult } from "./branch.ts";
import type { ResolvedCommit } from "./commit.ts";
import type { ResolveConfigResult } from "./configs/config.ts";
import type { GetInputsResult } from "./inputs.ts";
import { taskLogger } from "./logger.ts";
import { stringifyCurrentPatternContext } from "./string-templates-and-patterns/pattern-context.ts";
import {
  type OperationJob,
  OperationJobs,
  OperationKinds,
} from "../constants/operation-variables.ts";

export async function exportBaseOperationVariables(
  provider: PlatformProvider,
  options: {
    triggerContext: OperationTriggerContext;
    workingBranchResult: WorkingBranchResult;
    prForCommit: ProviderPullRequest | undefined;
    prFromBranch: ProviderPullRequest | undefined;
    inputsResult: GetInputsResult;
    configResult: ResolveConfigResult;
  },
) {
  const {
    triggerContext,
    workingBranchResult,
    prForCommit,
    prFromBranch,
    inputsResult,
    configResult,
  } = options;
  const { rawInputs, inputs } = inputsResult;
  const { rawConfig, config } = configResult;

  const resolvedTarget = prForCommit
    ? OperationKinds.release
    : OperationKinds.propose;

  const resolvedJobs: OperationJob[] = [];
  switch (resolvedTarget) {
    case "propose":
      // when add autorelease in the future, we wont push it it, TODO handle that
      if (prFromBranch) {
        resolvedJobs.push(OperationJobs.updatePr);
      } else {
        resolvedJobs.push(OperationJobs.createPr);
      }

      break;
    case "release":
      resolvedJobs.push(OperationJobs.createTag);

      if (!config.release.skipReleaseNote) {
        resolvedJobs.push(OperationJobs.createReleaseNote);
      }

      break;
  }

  const { token: _t, sourceMode: _sm, ...excludedInputs } = inputs;

  const prepareExportObject = {
    ...excludedInputs,

    sourceMode: rawInputs.sourceMode ?? "",
    internalSourceMode: JSON.stringify(inputs.sourceMode),

    config: JSON.stringify(rawConfig, jsonValueNormalizer),
    internalConfig: JSON.stringify(config, jsonValueNormalizer),

    parsedTriggerCommit: JSON.stringify(
      triggerContext.latestTriggerCommit.parsedCommit,
    ),
    parsedTriggerCommitList: JSON.stringify(
      triggerContext.parsedTriggerCommits,
    ),

    workingBranchName: workingBranchResult.name,
    workingBranchRef: workingBranchResult.ref,
    workingBranchHash: workingBranchResult.object.sha,

    operation: resolvedTarget,
    jobs: JSON.stringify(resolvedJobs),

    pullRequestNumber: resolvedTarget === "propose"
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

export async function exportPreProposeOperationVariables(
  provider: PlatformProvider,
  resolvedCommitEntries: ResolvedCommit[],
  previousVersion: SemVer | undefined,
  nextVersion: SemVer,
) {
  const prepareExportObject = {
    resolvedCommitEntries: JSON.stringify(resolvedCommitEntries),

    previousVersion: previousVersion ? format(previousVersion) : "",
    version: format(nextVersion),

    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PreProposeOperationVariables
    & Pick<DynamicOperationVariables, "patternContext">;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Pre propose operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, null, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}

export async function exportPostProposeOperationVariables(
  provider: PlatformProvider,
  prNumber: number,
  changesData: Map<string, string>,
) {
  const prepareExportObject = {
    committedFilePaths: JSON.stringify([...changesData.keys()]),

    pullRequestNumber: prNumber,
    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PostProposeOperationVariables
    & DynamicOperationVariables;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Post propose operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, null, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}

export async function exportPreReleaseOperationVariables(
  provider: PlatformProvider,
  prNumber: number,
  version: SemVer,
) {
  const prepareExportObject = {
    version: format(version),

    pullRequestNumber: prNumber,
    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PreReleaseOperationVariables
    & DynamicOperationVariables;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Pre release operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, null, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}

export async function exportPostReleaseOperationVariables(
  provider: PlatformProvider,
  tagHash: string,
  releaseId?: string | number,
  releaseUploadUrl?: string,
) {
  const prepareExportObject = {
    tagHash,
    releaseId,
    releaseUploadUrl,

    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PostReleaseOperationVariables
    & Pick<DynamicOperationVariables, "patternContext">;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Post release operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, null, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}
