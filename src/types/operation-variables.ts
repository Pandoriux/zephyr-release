import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export interface BaseOperationVariables {
  inputs: unknown;
  config: unknown;

  inputsCamelCase: InputsOutput;
  configCamelCase: ConfigOutput;

  target: "prepare" | "release";
  job: "create-pr" | "update-pr" | "create-release";
}
