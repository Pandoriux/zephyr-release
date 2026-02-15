import type {
  OperationJob,
  OperationTarget,
} from "../constants/operation-variables.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export interface BaseOperationVariables
  extends Omit<InputsOutput, "token" | "sourceMode"> {
  // spread inputs without token and sourceMode...

  sourceMode: string;
  internalSourceMode: string;

  config: string;
  internalConfig: string;

  parsedTriggerCommit: string;
  parsedTriggerCommitList: string;

  workingBranchName: string;
  workingBranchRef: string;
  workingBranchHash: string;

  target: OperationTarget;
  /** Stringify OperationJobs[] */
  jobs: string;
}

export interface DynamicOperationVariables {
  patternContext: string;
  pullRequestNumber: number | undefined;
}

export interface PreProposeOperationVariables {
  resolvedCommitEntries: string;

  previousVersion: string;
  version: string;
}

export interface PostProposeOperationVariables {
  committedFilePaths: string;
}
