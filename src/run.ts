import { exitIfRepoNotCheckedOut } from "./workflows/checkout.ts";
import { GetActionInputsOrExit } from "./workflows/inputs.ts";
import { resolveConfigOrExit } from "./workflows/config.ts";
import { prepareEnvironment } from "./workflows/prepare-environment.ts";
import { logger } from "./utils/logger.ts";
import { isCommandHookValid, runCommands } from "./workflows/command.ts";

export async function run() {
  logger.info("Preparing environment...");
  prepareEnvironment();
  logger.info("Environment prepared successfully.");

  logger.info("Reading inputs...");
  const inputs = GetActionInputsOrExit();
  logger.info("Inputs parsed successfully.");

  exitIfRepoNotCheckedOut(inputs.workspace);

  logger.info(
    "Resolving configuration from config file and config override...",
  );
  const config = resolveConfigOrExit(
    inputs.workspace,
    inputs.configPath,
    inputs.configFormat,
    inputs.configOverride,
    inputs.configOverrideFormat,
  );
  logger.info("Configuration resolved successfully.");

  if (config.commandHook?.pre && isCommandHookValid(config.commandHook.pre)) {
    logger.info("Pre commands executing...");
    const result = await runCommands(
      config.commandHook.pre,
      config.commandHook.timeout,
      config.commandHook.continueOnError,
      "Pre base proccess",
    );
    logger.info(result);
    logger.info("Pre commands executed successfully.");
  }
}
