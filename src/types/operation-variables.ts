import type { ExecutionMode } from "../constants/execution-modes.ts";
import type {
  OperationKind,
  OperationOutcome,
} from "../constants/operation-variables.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export type OperationVariables =
  // spread inputs without token and sourceMode...
  & Omit<InputsOutput, "token" | "sourceMode">
  & {
    // Base operation variables
    sourceMode: string;
    internalSourceMode: string;

    parsedTriggerCommit: string;
    parsedTriggerCommitList: string;

    workingBranchName: string;
    workingBranchRef: string;
    workingBranchHash: string;

    mode: ExecutionMode;
    operation: OperationKind;
    /** Stringified OperationJobs[] */
    jobs: string;

    // versioning and changelog
    resolvedCommitEntries: string;

    previousVersion: string;
    version: string;

    committedFilePaths: string;

    tagHash: string;
    releaseId?: string | number;
    releaseUploadUrl?: string;

    outcome: OperationOutcome;

    // Dynamic operation variables
    config: string;
    internalConfig: string;

    patternContext: string;
    pullRequestNumber: number | undefined;
  };

export type BaseOperationVariables = Pick<
  OperationVariables,
  | keyof Omit<InputsOutput, "token" | "sourceMode">
  | "sourceMode"
  | "internalSourceMode"
  | "parsedTriggerCommit"
  | "parsedTriggerCommitList"
  | "workingBranchName"
  | "workingBranchRef"
  | "workingBranchHash"
  | "mode"
  | "operation"
  | "jobs"
>;

export type DynamicOperationVariables = Pick<
  OperationVariables,
  | "config"
  | "internalConfig"
  | "patternContext"
  | "pullRequestNumber"
>;

export type PreProposeOperationVariables = Pick<
  OperationVariables,
  "resolvedCommitEntries" | "previousVersion" | "version"
>;

export type PostProposeOperationVariables = Pick<
  OperationVariables,
  "committedFilePaths"
>;

export type PreReleaseOperationVariables = Pick<
  OperationVariables,
  "version"
>;

export type PostReleaseOperationVariables = Pick<
  OperationVariables,
  "tagHash" | "releaseId" | "releaseUploadUrl"
>;

export type FinalOperationVariables = Pick<OperationVariables, "outcome">;
