import * as core from "@actions/core";
import { throwIfRepoNotCheckedOut } from "./workflows/checkout.ts";
import { GetActionInputs } from "./workflows/inputs.ts";
import { resolveConfig } from "./config.ts";

export async function run() {
  core.info("Reading inputs...");
  const inputs = GetActionInputs();
  core.info("Inputs parsed successfully.");

  throwIfRepoNotCheckedOut(inputs.workspace);

  core.info("Resolving configuration from config file and config override...");
  const config = resolveConfig(
    inputs.workspace,
    inputs.configPath,
    inputs.configOverride,
  );
  core.info("Configuration resolved successfully.");
}
