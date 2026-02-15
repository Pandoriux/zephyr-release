import type { PlatformProvider } from "./types/providers/platform-provider.ts";
import { logger } from "./tasks/logger.ts";
import { getInputsOrThrow } from "./tasks/inputs.ts";
import { setupOperation } from "./tasks/setup.ts";
import { resolveConfigOrThrow } from "./tasks/configs/config.ts";
import { runCommandsOrThrow } from "./tasks/command.ts";
import { createFixedBaseStringPatternContext } from "./tasks/string-templates-and-patterns/pattern-context.ts";
import {
  findPullRequestForCommitOrThrow,
  findPullRequestFromBranchOrThrow,
} from "./tasks/pull-request.ts";
import { exportBaseOperationVariables } from "./tasks/export-variables.ts";
import { proposeWorkflow } from "./workflows/propose.ts";
import { releaseWorkflow } from "./workflows/release.ts";
import { manageConcurrencyOrExit } from "./tasks/concurrency.ts";
import { createCustomStringPatternContext } from "./tasks/string-templates-and-patterns/pattern-context.ts";
import { registerTransformersToTemplateEngine } from "./tasks/string-templates-and-patterns/transformers.ts";
import { setupWorkingBranchOrThrow } from "./tasks/branch.ts";
import { validateCurrentOperationCtxOrExit } from "./tasks/operation.ts";

export async function run(provider: PlatformProvider) {
  logger.stepStart("Starting: Get operation inputs");
  const inputsResult = getInputsOrThrow(provider);
  const { inputs } = inputsResult;
  logger.stepFinish("Finished: Get operation inputs");

  logger.stepStart("Starting: Set up operation");
  setupOperation(provider, inputs);
  logger.stepFinish("Finished: Set up operation");

  logger.stepStart("Starting: Manage concurrency");
  const concurrencyResult = await manageConcurrencyOrExit(provider);
  logger.stepFinish("Finished: Manage concurrency");

  logger.stepStart("Starting: Resolve config from file and override");
  const configResult = await resolveConfigOrThrow(provider, inputs);
  const { config } = configResult;
  logger.stepFinish("Finished: Resolve config from file and override");

  logger.stepStart("Starting: Parse and validate current operation context");
  const operationContext = await validateCurrentOperationCtxOrExit(
    provider,
    concurrencyResult,
    config.commitTypes,
  );
  logger.stepFinish("Finished: Parse and validate current operation context");

  logger.stepStart("Starting: Register transformers to template engine");
  registerTransformersToTemplateEngine(provider);
  logger.stepFinish("Finished: Register transformers to template engine");

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

  logger.stepStart("Starting: Ensure working branch is prepared");
  const workingBranchResult = await setupWorkingBranchOrThrow(
    provider,
    inputs,
    config,
  );
  logger.stepFinish("Finished: Ensure working branch is prepared");

  logger.stepStart("Starting: Get associated pull requests");
  const associatedPrForCommit = await findPullRequestForCommitOrThrow(
    provider,
    workingBranchResult.name,
    inputs,
    config,
  );
  const associatedPrFromBranch = await findPullRequestFromBranchOrThrow(
    provider,
    workingBranchResult.name,
    inputs,
    config,
  );
  logger.stepFinish(
    "Finished: Get associated pull requests",
  );

  logger.debugStepStart("Starting: Export base operation variables");
  await exportBaseOperationVariables(provider, {
    operationContext,
    workingBranchResult,
    prForCommit: associatedPrForCommit,
    prFromBranch: associatedPrFromBranch,
    inputsResult,
    configResult,
  });
  logger.debugStepFinish("Finished: Export base operation variables");

  logger.stepStart("Starting: Execute base pre commands");
  const preResult = await runCommandsOrThrow(config.commandHook, "pre");
  if (preResult) {
    logger.stepFinish(`Finished: Execute base pre commands. ${preResult}`);
  } else {
    logger.stepSkip("Skipped: Execute base pre commands (empty)");
  }

  // Main operation workflow
  if (!associatedPrForCommit) {
    logger.stepStart(
      "Start Workflow: Create/Update release proposal pull request",
    );
    await proposeWorkflow(provider, {
      workingBranchResult,
      associatedPrFromBranch,
      operationContext,
      inputs,
      config,
    });
  } else {
    if (config.release.enabled) {
      logger.stepStart("Start Workflow: Create tag and release");
      await releaseWorkflow(provider, { operationContext, inputs, config });
    } else {
      logger.stepSkip(
        "Skip Workflow: Create tag and release (disabled in config)",
      );
    }
  }

  logger.stepStart("Starting: Execute base post commands");
  const postResult = await runCommandsOrThrow(config.commandHook, "post");
  if (postResult) {
    logger.stepFinish(`Finished: Execute base post commands. ${postResult}`);
  } else {
    logger.stepSkip("Skipped: Execute base post commands (empty)");
  }
}
