import { throwIfRepoNotCheckedOut } from "./workflows/checkout.ts";
import { GetActionInputs } from "./workflows/inputs.ts";
import { resolveConfig } from "./workflows/config.ts";
import { prepareEnvironment } from "./workflows/prepare-environment.ts";
import { logger } from "./utils/logger.ts";

export async function run() {
  logger.info("Preparing environment...");
  prepareEnvironment();
  logger.info("Environment prepared successfully.");

  logger.info("Reading inputs...");
  const inputs = GetActionInputs();
  logger.info("Inputs parsed successfully.");

  throwIfRepoNotCheckedOut(inputs.workspace);

  logger.info(
    "Resolving configuration from config file and config override...",
  );
  const config = resolveConfig(
    inputs.workspace,
    inputs.configPath,
    inputs.configFormat,
    inputs.configOverride,
    inputs.configOverrideFormat,
  );
  logger.info("Configuration resolved successfully.");
}
