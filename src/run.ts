import type { PlatformProvider } from "./types/providers/platform-provider.ts";
import { logger } from "./tasks/logger.ts";
import { getInputsOrThrow } from "./tasks/inputs.ts";
import { setupOperation } from "./tasks/setup.ts";
import { resolveConfigOrThrow } from "./tasks/config.ts";
import { runCommandsOrThrow } from "./tasks/command.ts";
import { getBaseOpVariables } from "./tasks/get-variables.ts";
import { getBaseStringPatternContext } from "./tasks/string-patterns/string-pattern-context.ts";

export async function run(provider: PlatformProvider, startTime: Date) {
  logger.stepStart("Starting: Setup operation");
  setupOperation();
  logger.stepFinish("Finished: Setup operation");

  logger.stepStart("Starting: Get inputs");
  const inputs = getInputsOrThrow(provider);
  logger.stepFinish("Finished: Get inputs");

  // keep for now
  // isRepoCheckedOut(inputs.workspacePath);

  logger.stepStart("Starting: Resolve config from file and override");
  const config = await resolveConfigOrThrow(provider, inputs);
  logger.stepFinish("Finished: Resolve config from file and override");

  logger.debugStepStart("Starting: Get base string pattern context");
  const baseStringPatternCtx = getBaseStringPatternContext(
    provider,
    startTime,
    config,
  );
  logger.debugStepFinish("Finished: Get base string pattern context");

  const baseOpVar = await getBaseOpVariables(provider, inputs);

  logger.stepStart("Starting: Execute base pre commands");
  const result = await runCommandsOrThrow(config.commandHook, "pre");
  if (result) {
    logger.stepFinish(`Finished: Execute base pre commands. ${result}`);
  } else {
    logger.stepSkip("Skipped: Execute base pre commands (empty)");
  }
}
