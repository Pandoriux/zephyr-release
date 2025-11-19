import process from "node:process";
import core from "@actions/core";
import { manualExit } from "./main.ts";

export function GetActionInputs() {
  const workspace = process.env.GITHUB_WORKSPACE!;

  const token = core.getInput("token", { required: true });
  const configPath = core.getInput("config-path");
  const configInline = core.getInput("config-inline");

  if (!configPath && !configInline) {
    manualExit(
      "Missing required input. Must set either `config-path` or `config-inline`.",
    );
  }

  return { workspace, token, configPath, configInline };
}
