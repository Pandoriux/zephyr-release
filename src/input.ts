import process from "node:process";
import * as core from "@actions/core";
import { exitFailure } from "./lifecycle.ts";

interface ActionInputs {
  workspace: string;
  token: string;
  configPath: string;
  configOverrideStr: string;
}

export function GetActionInputs(): ActionInputs {
  const workspace = process.env.GITHUB_WORKSPACE!;

  const token = core.getInput("token", { required: true });
  const configPath = core.getInput("config-path");
  const configOverrideStr = core.getInput("config-override");

  if (!configPath && !configOverrideStr) {
    exitFailure(
      "Missing required input. Must set either `config-path` or `config-override`.",
    );
  }

  const inputs = { workspace, token, configPath, configOverrideStr };
  core.debug(JSON.stringify(inputs, null, 2));

  return inputs;
}
