import type { PlatformProvider } from "./types/platform-provider.ts";
import { logger } from "./tasks/logger.ts";
import { getInputsOrThrow } from "./tasks/inputs.ts";
import { prepareTools } from "./tasks/tools.ts";
import { resolveConfigOrThrow } from "./tasks/config.ts";
import { runCommandsOrThrow } from "./tasks/command.ts";

export async function run(provider: PlatformProvider) {
  logger.stepStart("Starting: Prepare tools");
  prepareTools();
  logger.stepFinish("Finished: Prepare tools");

  logger.stepStart("Starting: Get inputs");
  const inputs = getInputsOrThrow(provider);
  logger.stepFinish("Finished: Get inputs");

  // keep for now
  // isRepoCheckedOut(inputs.workspacePath);

  logger.stepStart("Starting: Resolve config from file and override");
  const config = await resolveConfigOrThrow(provider, inputs);
  logger.stepFinish("Finished: Resolve config from file and override");

  logger.stepStart("Starting: Execute base pre commands");
  const result = await runCommandsOrThrow(config.commandHook, "pre");
  if (result) {
    logger.stepFinish(`Finished: Execute base pre commands. ${result}`);
  } else {
    logger.stepSkip("Skipped: Execute base pre commands (empty)");
  }
}
