import type { OperationTriggerContext } from "../types/operation-context.ts";
import type {
  BaseOperationVariables,
  DynamicOperationVariables,
  FinalOperationVariables,
  PostPrepareOperationVariables,
  PostPublishOperationVariables,
  PrePrepareOperationVariables,
  PrePublishOperationVariables,
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
import { taskLogger } from "./logger.ts";
import { stringifyCurrentPatternContext } from "./string-templates-and-patterns/pattern-context.ts";
import {
  type OperationJob,
  OperationJobs,
  type OperationKind,
  OperationKinds,
  type OperationOutcome,
} from "../constants/operation-variables.ts";
import type { ProviderInputs } from "../types/providers/inputs.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export async function exportBaseOperationVariables(
  provider: PlatformProvider,
  options: {
    triggerContext: OperationTriggerContext;
    workingBranchResult: WorkingBranchResult;
    prForCommit: ProviderPullRequest | undefined;
    prFromBranch: ProviderPullRequest | undefined;
    rawInputs: ProviderInputs;
    inputs: InputsOutput;
    rawConfig: object;
    config: ConfigOutput;
  },
) {
  const {
    triggerContext,
    workingBranchResult,
    prForCommit,
    prFromBranch,
    rawInputs,
    inputs,
    rawConfig,
    config,
  } = options;

  let operationTarget: OperationKind | undefined;
  switch (config.mode) {
    case "review":
      operationTarget = prForCommit
        ? OperationKinds.release
        : OperationKinds.propose;

      break;

    case "auto":
      operationTarget = OperationKinds.autorelease;

      break;
  }

  const operationJobs: OperationJob[] = [];
  switch (operationTarget) {
    case "propose":
      if (prFromBranch) {
        operationJobs.push(OperationJobs.updatePr);
      } else {
        operationJobs.push(OperationJobs.createPr);
      }

      break;

    case "release":
      if (config.tag.createTag) {
        operationJobs.push(OperationJobs.createTag);
      }

      if (config.tag.createTag && config.release.createReleaseNote) {
        operationJobs.push(OperationJobs.createReleaseNote);
      }

      break;

    case "autorelease":
      operationJobs.push(OperationJobs.createCommit);

      if (config.tag.createTag) {
        operationJobs.push(OperationJobs.createTag);
      }

      if (config.tag.createTag && config.release.createReleaseNote) {
        operationJobs.push(OperationJobs.createReleaseNote);
      }

      break;
  }

  const { token: _t, sourceMode: _sm, ...excludedInputs } = inputs;

  const prepareExportObject = {
    ...excludedInputs,

    sourceMode: rawInputs.sourceMode ?? "",
    internalSourceMode: JSON.stringify(inputs.sourceMode),

    parsedTriggerCommit: JSON.stringify(
      triggerContext.latestTriggerCommit.parsedCommit,
    ),
    parsedTriggerCommitList: JSON.stringify(
      triggerContext.parsedTriggerCommits,
    ),

    workingBranchName: workingBranchResult.name,
    workingBranchRef: workingBranchResult.ref,
    workingBranchHash: workingBranchResult.object.sha,

    mode: config.mode,
    operation: operationTarget,
    jobs: JSON.stringify(operationJobs),

    config: JSON.stringify(rawConfig, jsonValueNormalizer),
    internalConfig: JSON.stringify(config, jsonValueNormalizer),

    pullRequestNumber: operationTarget === "propose"
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
  previousVersion: SemVer | undefined,
  version: SemVer,
) {
  const prepareExportObject = {
    resolvedCommitEntries: JSON.stringify(resolvedCommitEntries),

    previousVersion: previousVersion ? format(previousVersion) : "",
    version: format(version),

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
    & Pick<DynamicOperationVariables, "pullRequestNumber" | "patternContext">;

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

export async function exportPrePublishOperationVariables(
  provider: PlatformProvider,
  prNumber: number,
  version: SemVer,
) {
  const prepareExportObject = {
    version: format(version),

    pullRequestNumber: prNumber,
    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PrePublishOperationVariables
    & Pick<DynamicOperationVariables, "patternContext" | "pullRequestNumber">;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Pre publish operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, null, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}

export async function exportPostPublishOperationVariables(
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
    & PostPublishOperationVariables
    & Pick<DynamicOperationVariables, "patternContext">;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Post publish operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, null, 2));
    dLogger.endGroup();
  });

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}

export function exportFinalOperationVariables(
  provider: PlatformProvider,
  outcome: OperationOutcome,
) {
  const prepareExportObject = {
    outcome,
  } satisfies FinalOperationVariables;

  taskLogger.debug(
    "Final operation variables to export:\n" +
      JSON.stringify(prepareExportObject, null, 2),
  );

  Object.entries(prepareExportObject).forEach(([k, v]) => {
    provider.exportOutputs(toExportOutputKey(k), v);
    provider.exportEnvVars(toExportEnvVarKey(k), v);
  });
}
