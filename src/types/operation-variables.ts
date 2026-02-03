import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export interface BaseOperationVariables
  extends Omit<InputsOutput, "token" | "sourceMode"> {
  // spread inputs without token and sourceMode...

  sourceMode: string;
  internalSourceMode: string;

  config: string;
  internalConfig: string;

  patternContext: string;

  target: "prepare" | "release";
  job: "create-pr" | "update-pr" | "create-release";
}

export interface PrePrepareOperationVariables {
}
