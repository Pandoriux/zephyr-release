import process from "node:process";
import * as core from "@actions/core";
import { manualExit } from "./main.ts";

export function GetActionInputs() {
  const workspace = process.env.GITHUB_WORKSPACE!;

  const token = core.getInput("token", { required: true });
  const configPath = core.getInput("config-path");
  const configInline = core.getInput("config-override");

  if (!configPath && !configInline) {
    manualExit(
      "Missing required input. Must set either `config-path` or `config-override`.",
    );
  }

  return { workspace, token, configPath, configInline };
}
