import type { OperationKind } from "../constants/operation-variables.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export type OperationVariables =
  // spread inputs without token and sourceMode...
  & Omit<InputsOutput, "token" | "sourceMode">
  & {
    // Base operation variables
    sourceMode: string;
    internalSourceMode: string;

    config: string;
    internalConfig: string;

    parsedTriggerCommit: string;
    parsedTriggerCommitList: string;

    workingBranchName: string;
    workingBranchRef: string;
    workingBranchHash: string;

    operation: OperationKind;
    /** Stringify OperationJobs[] */
    jobs: string;

    // versioning and changelog
    resolvedCommitEntries: string;

    previousVersion: string;
    version: string;

    committedFilePaths: string;

    // Dynamic operation variables
    patternContext: string;
    pullRequestNumber: number | undefined;
  };

export type BaseOperationVariables = Pick<
  OperationVariables,
  | keyof Omit<InputsOutput, "token" | "sourceMode">
  | "sourceMode"
  | "internalSourceMode"
  | "config"
  | "internalConfig"
  | "parsedTriggerCommit"
  | "parsedTriggerCommitList"
  | "workingBranchName"
  | "workingBranchRef"
  | "workingBranchHash"
  | "operation"
  | "jobs"
>;

export type DynamicOperationVariables = Pick<
  OperationVariables,
  "patternContext" | "pullRequestNumber"
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
