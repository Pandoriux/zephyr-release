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

  target: "prepare" | "release";
  job: "create-pr" | "update-pr" | "create-release";
}

export interface DynamicOperationVariables {
  patternContext: string;
  pullRequestNumber: number | undefined;
}

export interface PrePrepareOperationVariables {
  resolvedCommitEntries: string;

  currentVersion: string;
  nextVersion: string;
}

export interface PostPrepareOperationVariables {
  committedFilePaths: string;
}
