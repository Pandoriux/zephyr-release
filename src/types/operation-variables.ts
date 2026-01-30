import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export interface BaseOperationVariables
  extends Omit<InputsOutput, "token" | "sourceMode"> {
  // spread inputs without token and sourceMode...

  // inputs sourceMode with changes
  sourceModeStr: string;
  sourceModeCamelCaseStr: string;

  configStr: string;
  configCamelCaseStr: string;

  target: "prepare" | "release";
  job: "create-pr" | "update-pr" | "create-release";
}

export interface PrePrepareOperationVariables {
}
