import core from "@actions/core";
import { throwIfRepoNotCheckedOut } from "./checkout.ts";
import { GetActionInputs } from "./input.ts";
import { resolveConfig } from "./config.ts";

export async function run() {
  core.info("Reading inputs...");
  const inputs = GetActionInputs();
  core.info("Inputs parsed successfully.");
  core.debug(JSON.stringify(inputs, null, 2));

  throwIfRepoNotCheckedOut(inputs.workspace);

  core.info("Resolving configuration from config file and config override...");
  const config = resolveConfig(
    inputs.workspace,
    inputs.configPath,
    inputs.configInline,
  );
  core.info("Configuration resolved successfully.");
  core.debug(JSON.stringify(config, null, 2));
}
