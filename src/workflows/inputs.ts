import process from "node:process";
import * as v from "@valibot/valibot";
import * as core from "@actions/core";
import { InputsSchema } from "../schemas/inputs/inputs.ts";
import { exitFailure } from "../lifecycle.ts";
import { formatValibotIssues } from "../utils/formatters/valibot.ts";

export function GetActionInputs() {
  const rawInputs = {
    workspace: process.env.GITHUB_WORKSPACE,
    token: core.getInput("token", { required: true }),
    configPath: core.getInput("config-path"),
    configFormat: core.getInput("config-format"),
    configOverride: core.getInput("config-override"),
    configOverrideFormat: core.getInput("config-override-format"),
  };

  const parsedInputsResult = v.safeParse(InputsSchema, rawInputs);
  if (!parsedInputsResult.success) {
    exitFailure(formatValibotIssues(parsedInputsResult.issues));
  }

  core.startGroup("Parsed inputs:");
  core.info(JSON.stringify(parsedInputsResult.output, null, 2));
  core.endGroup();

  return parsedInputsResult.output;
}
