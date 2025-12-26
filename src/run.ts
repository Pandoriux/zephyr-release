import { prepareTools } from "./tasks/prepare-tools.ts";
import { isCommandHookValid, runCommandsOrThrow } from "./tasks/command.ts";
import type { PlatformProvider } from "./types/platform-provider.ts";
import { logger } from "./tasks/logger.ts";

export async function run(provider: PlatformProvider) {
  logger.info("Preparing tools...");
  prepareTools();
  logger.info("Tools prepared successfully.");

  logger.info("Reading inputs...");
  const inputs = provider.getInputsOrThrow();
  logger.info("Inputs parsed successfully.");

  // isRepoCheckedOut(inputs.workspacePath);

  logger.info(
    "Resolving configuration from config file and config override...",
  );
  const config = provider.resolveConfigOrThrow(
    inputs.workspacePath,
    inputs.configPath,
    inputs.configFormat,
    inputs.configOverride,
    inputs.configOverrideFormat,
  );
  logger.info("Configuration resolved successfully.");

  if (config.commandHook?.pre && isCommandHookValid(config.commandHook.pre)) {
    logger.info("Pre commands executing...");
    const result = await runCommandsOrThrow(
      config.commandHook.pre,
      config.commandHook.timeout,
      config.commandHook.continueOnError,
      "Pre base process",
    );
    logger.info(result);
    logger.info("Pre commands executed successfully.");
  }
}
