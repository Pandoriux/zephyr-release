import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export interface BaseOperationVariables
  extends Omit<InputsOutput, "token" | "sourceMode"> {
  // spread inputs without token and sourceMode...

  sourceMode: string;
  internalSourceMode: string;

  config: string;
  internalConfig: string;

  workingBranchName: string;
  workingBranchRef: string;
  workingBranchHash: string;

  target: "prepare" | "release";
  job: "create-pr" | "update-pr" | "create-release";
}

export interface DynamicOperationVariables {
  patternContext: string;
}

export interface PrePrepareOperationVariables {
  triggerCommit: string; // maybe swicth this to base?
  resolvedCommits: string;

  currentVersion: string;
  nextVersion: string;
}
