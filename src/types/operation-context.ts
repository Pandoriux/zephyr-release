import type { Commit } from "conventional-commits-parser";
import type { ProviderInputs } from "./providers/inputs.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export interface OperationTriggerContext {
  latestTriggerCommit: { parsedCommit: Commit; treeHash: string };
  parsedTriggerCommits: Commit[];
}

export interface OperationRunContext {
  rawInputs: ProviderInputs;
  inputs: InputsOutput;
  rawConfig: object;
  config: ConfigOutput;
}
