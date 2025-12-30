import type { PlatformProvider } from "./types/platform-provider.ts";
import { logger } from "./tasks/logger.ts";
import { getInputsOrThrow } from "./tasks/inputs.ts";
import { prepareTools } from "./tasks/prepare-tools.ts";
import { resolveConfigOrThrow } from "./tasks/config.ts";
import { runCommandsOrThrow } from "./tasks/command.ts";

export async function run(provider: PlatformProvider) {
  logger.info("Starting: Prepare tools");
  prepareTools();
  logger.info("Finished: Prepare tools");

  logger.info("Starting: Get inputs");
  const inputs = getInputsOrThrow(provider);
  logger.info("Finished: Get inputs");

  // keep for now
  // isRepoCheckedOut(inputs.workspacePath);

  logger.info("Starting: Resolve config from file and override");
  const config = await resolveConfigOrThrow(provider, inputs);
  logger.info("Finished: Resolve config from file and override");

  logger.info("Starting: Execute base pre commands");
  const result = await runCommandsOrThrow(config.commandHook, "pre");
  if (result) {
    logger.info(`Finished: Execute base pre commands. ${result}`);
  } else {
    logger.info("Skipped: Execute base pre commands (empty)");
  }
}
