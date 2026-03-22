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
import type { ProviderProposal } from "../types/providers/proposal.ts";
import {
  toExportEnvVarKey,
  toExportOutputKey,
} from "../utils/transformers/case.ts";
import { jsonValueNormalizer } from "../utils/transformers/json.ts";
import { format, type SemVer } from "@std/semver";
import type { WorkingBranchResult } from "./branch.ts";
import type { ResolvedCommit } from "./commit.ts";
import { taskLogger } from "./logger.ts";
import {
  type OperationJob,
  type OperationKind,
  OperationKinds,
  type OperationOutcome,
} from "../constants/operation-variables.ts";
import type { ProviderInputs } from "../types/providers/inputs.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import { STRING_PATTERN_CONTEXT } from "./string-templates-and-patterns/pattern-context.ts";

export async function exportBaseOperationVariables(
  provider: PlatformProvider,
  options: {
    triggerContext: OperationTriggerContext;
    workingBranchResult: WorkingBranchResult;
    proposalForCommit: ProviderProposal | undefined;
    proposalFromBranch: ProviderProposal | undefined;
    rawInputs: ProviderInputs;
    inputs: InputsOutput;
    rawConfig: object;
    config: ConfigOutput;
  },
) {
  const {
    triggerContext,
    workingBranchResult,
    proposalForCommit,
    proposalFromBranch,
    rawInputs,
    inputs,
    rawConfig,
    config,
  } = options;

  let operationKind: OperationKind | undefined;
  switch (config.mode) {
    case "review":
      operationKind = proposalForCommit
        ? OperationKinds.release
        : OperationKinds.propose;

      break;

    case "auto":
      operationKind = OperationKinds.autorelease;

      break;
  }

  const operationJobs: OperationJob[] = [];
  switch (operationKind) {
    case "propose":
      if (proposalFromBranch) {
        operationJobs.push("update-proposal");
      } else {
        operationJobs.push("create-proposal");
      }

      break;

    case "release":
      if (config.tag.createTag) {
        operationJobs.push("create-tag");
      }

      if (config.tag.createTag && config.release.createRelease) {
        operationJobs.push("create-release");
      }

      break;

    case "autorelease":
      // Empty
      // For mode "auto", jobs are available at post prepare phase

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
    operation: operationKind,
    jobs: JSON.stringify(operationJobs),

    config: JSON.stringify(rawConfig, jsonValueNormalizer),
    internalConfig: JSON.stringify(config, jsonValueNormalizer),

    proposalId: operationKind === "propose"
      ? proposalFromBranch?.id
      : proposalForCommit?.id,
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
  commitHash: string,
  changesData: Map<string, string>,
  modeRelatedData?: {
    proposalId?: string;
    config?: ConfigOutput;
  },
) {
  const { proposalId, config } = modeRelatedData ?? {};

  const operationJobs: OperationJob[] = [];
  if (config) {
    operationJobs.push("create-commit");

    if (config.tag.createTag) {
      operationJobs.push("create-tag");
    }

    if (config.tag.createTag && config.release.createRelease) {
      operationJobs.push("create-release");
    }
  }

  const prepareExportObject = {
    commitHash,
    committedFilePaths: JSON.stringify([...changesData.keys()]),
    jobs: JSON.stringify(operationJobs),

    proposalId: proposalId,
    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PostPrepareOperationVariables
    & Pick<DynamicOperationVariables, "proposalId" | "patternContext">;

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
  proposalId: string,
  version: SemVer,
) {
  const prepareExportObject = {
    version: format(version),

    proposalId: proposalId,
    patternContext: await stringifyCurrentPatternContext(),
  } satisfies
    & PrePublishOperationVariables
    & Pick<DynamicOperationVariables, "patternContext" | "proposalId">;

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

async function stringifyCurrentPatternContext(): Promise<string> {
  const resolvedContext: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(STRING_PATTERN_CONTEXT)) {
    if (typeof value === "function") {
      try {
        const result = await value();
        // If result is not another function, use it; otherwise use original value
        resolvedContext[key] = typeof result !== "function" ? result : value;
      } catch {
        // If function throws, use original value
        resolvedContext[key] = value;
      }
    } else {
      resolvedContext[key] = value;
    }
  }

  // jsonValueNormalizer will catch weird value like BigInt, ...
  return JSON.stringify(resolvedContext, jsonValueNormalizer);
}
