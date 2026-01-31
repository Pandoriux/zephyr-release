import type { PlatformProvider } from "./types/providers/platform-provider.ts";
import { logger } from "./tasks/logger.ts";
import { getInputsOrThrow } from "./tasks/inputs.ts";
import { setupOperation } from "./tasks/setup.ts";
import { resolveConfigOrThrow } from "./tasks/config.ts";
import { runCommandsOrThrow } from "./tasks/command.ts";
import { createFixedBaseStringPatternContext } from "./tasks/string-templates-and-patterns/pattern-context.ts";
import {
  findPullRequestForCommitOrThrow,
  findPullRequestFromBranchOrThrow,
} from "./tasks/pull-request.ts";
import { exportBaseOperationVariables } from "./tasks/export-variables.ts";
import { prepareWorkflow } from "./workflows/prepare.ts";
import { releaseWorkflow } from "./workflows/release.ts";
import { manageConcurrency } from "./tasks/concurrency.ts";
import { createCustomStringPatternContext } from "./tasks/string-templates-and-patterns/pattern-context.ts";

export async function run(provider: PlatformProvider) {
  logger.stepStart("Starting: Get operation inputs");
  const inputsResult = getInputsOrThrow(provider);
  const { rawInputs, inputs } = inputsResult;
  logger.stepFinish("Finished: Get operation inputs");

  logger.stepStart("Starting: Set up operation");
  setupOperation(provider, inputs);
  logger.stepFinish("Finished: Set up operation");

  logger.stepStart("Starting: Manage concurrency");
  await manageConcurrency(provider);
  logger.stepFinish("Finished: Manage concurrency");

  logger.stepStart("Starting: Resolve config from file and override");
  const configResult = await resolveConfigOrThrow(provider, inputs);
  const { rawConfig, config } = configResult;
  logger.stepFinish("Finished: Resolve config from file and override");

  logger.debugStepStart("Starting: Create custom string pattern context");
  createCustomStringPatternContext(config.customStringPatterns);
  logger.debugStepFinish("Finished: Create custom string pattern context");

  logger.debugStepStart("Starting: Create fixed base string pattern context");
  await createFixedBaseStringPatternContext(
    provider,
    inputs.triggerBranchName,
    config,
  );
  logger.debugStepFinish("Finished: Create fixed base string pattern context");

  logger.stepStart("Starting: Get associated pull requests");
  const associatedPrForCommit = await findPullRequestForCommitOrThrow(
    provider,
    inputs,
    config,
  );
  const associatedPrFromBranch = await findPullRequestFromBranchOrThrow(
    provider,
    config,
  );
  logger.stepFinish(
    "Finished: Get associated pull requests",
  );

  logger.debugStepStart("Starting: Export base operation variables");
  exportBaseOperationVariables(
    provider,
    inputsResult,
    configResult,
    Boolean(associatedPrForCommit),
    Boolean(associatedPrFromBranch),
  );
  logger.debugStepFinish("Finished: Export base operation variables");

  logger.stepStart("Starting: Execute base pre commands");
  const preResult = await runCommandsOrThrow(config.commandHook, "pre");
  if (preResult) {
    logger.stepFinish(`Finished: Execute base pre commands. ${preResult}`);
  } else {
    logger.stepSkip("Skipped: Execute base pre commands (empty)");
  }

  if (!associatedPrForCommit) {
    logger.stepStart("Workflow: Prepare release with pull request");
    await prepareWorkflow(provider, { inputs, config });
  } else {
    logger.stepStart("Workflow: Release finalize");
    await releaseWorkflow(provider);
  }

  logger.stepStart("Starting: Execute base post commands");
  // post cmds.... todo
}
