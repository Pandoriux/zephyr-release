import type { PlatformProvider } from "./types/providers/platform-provider.ts";
import { logger } from "./tasks/logger.ts";
import { getInputsOrThrow } from "./tasks/inputs.ts";
import { setupOperation } from "./tasks/setup.ts";
import {
  resolveConfigOrThrow,
  resolveRuntimeConfigOverrideOrThrow,
} from "./tasks/configs/config.ts";
import { runCommandsOrThrow } from "./tasks/command.ts";
import { createFixedBaseStringPatternContext } from "./tasks/string-templates-and-patterns/pattern-context.ts";
import {
  findPullRequestForCommitOrThrow,
  findPullRequestFromBranchOrThrow,
} from "./tasks/pull-request.ts";
import { exportBaseOperationVariables } from "./tasks/export-variables.ts";
import { proposeWorkflow } from "./workflows/propose.ts";
import { releaseWorkflow } from "./workflows/release.ts";
import { createCustomStringPatternContext } from "./tasks/string-templates-and-patterns/pattern-context.ts";
import { registerTransformersToTemplateEngine } from "./tasks/string-templates-and-patterns/transformers.ts";
import { setupWorkingBranchOrThrow } from "./tasks/branch.ts";
import { validateCurrentOperationTriggerCtxOrExit } from "./tasks/operation.ts";
import type { OperationRunContext } from "./types/operation-context.ts";
import type { ProviderInputs } from "./types/providers/inputs.ts";
import type { InputsOutput } from "./schemas/inputs/inputs.ts";
import type { ConfigOutput } from "./schemas/configs/config.ts";

function generateOperationRunContext(): OperationRunContext {
  let _rawInputs: ProviderInputs | undefined;
  let _inputs: InputsOutput | undefined;
  let _rawConfig: object | undefined;
  let _config: ConfigOutput | undefined;

  return {
    get rawInputs() {
      if (_rawInputs === undefined) {
        throw new Error("Raw inputs have not been initialized");
      }
      return _rawInputs;
    },
    set rawInputs(value: ProviderInputs) {
      _rawInputs = value;
    },

    get inputs() {
      if (_inputs === undefined) {
        throw new Error("Inputs have not been initialized");
      }
      return _inputs;
    },
    set inputs(value: InputsOutput) {
      _inputs = value;
    },

    get rawConfig() {
      if (_rawConfig === undefined) {
        throw new Error("Raw config has not been initialized");
      }
      return _rawConfig;
    },
    set rawConfig(value: object) {
      _rawConfig = value;
    },

    get config() {
      if (_config === undefined) {
        throw new Error("Config has not been initialized");
      }
      return _config;
    },
    set config(value: ConfigOutput) {
      _config = value;
    },
  };
}

export async function run(provider: PlatformProvider) {
  logger.debugStepStart("Starting: Generate operation run context");
  const runCtx = generateOperationRunContext();
  logger.debugStepFinish("Finished: Generate operation run context");

  logger.stepStart("Starting: Get operation inputs");
  const _inputsResult = getInputsOrThrow(provider);
  runCtx.rawInputs = _inputsResult.rawInputs;
  runCtx.inputs = _inputsResult.inputs;
  logger.stepFinish("Finished: Get operation inputs");

  logger.stepStart("Starting: Set up operation");
  setupOperation(provider, runCtx.inputs);
  logger.stepFinish("Finished: Set up operation");

  logger.stepStart("Starting: Resolve config from file and override");
  const _configResult = await resolveConfigOrThrow(provider, runCtx.inputs);
  runCtx.rawConfig = _configResult.rawConfig;
  runCtx.config = _configResult.config;
  logger.stepFinish("Finished: Resolve config from file and override");

  logger.stepStart("Starting: Parse and validate current trigger context");
  const triggerContext = validateCurrentOperationTriggerCtxOrExit(
    provider,
    runCtx.config.commitTypes,
  );
  logger.stepFinish("Finished: Parse and validate current trigger context");

  logger.stepStart("Starting: Register transformers to template engine");
  registerTransformersToTemplateEngine(provider);
  logger.stepFinish("Finished: Register transformers to template engine");

  logger.debugStepStart("Starting: Create custom string pattern context");
  createCustomStringPatternContext(runCtx.config.customStringPatterns);
  logger.debugStepFinish("Finished: Create custom string pattern context");

  logger.debugStepStart("Starting: Create fixed base string pattern context");
  await createFixedBaseStringPatternContext(
    provider,
    runCtx.inputs.triggerBranchName,
    runCtx.config,
  );
  logger.debugStepFinish("Finished: Create fixed base string pattern context");

  logger.stepStart("Starting: Ensure working branch is prepared");
  const workingBranchResult = await setupWorkingBranchOrThrow(
    provider,
    runCtx.inputs,
    runCtx.config,
  );
  logger.stepFinish("Finished: Ensure working branch is prepared");

  logger.stepStart("Starting: Get associated pull requests");
  const associatedPrForCommit = await findPullRequestForCommitOrThrow(
    provider,
    workingBranchResult.name,
    runCtx.inputs,
    runCtx.config,
  );
  const associatedPrFromBranch = await findPullRequestFromBranchOrThrow(
    provider,
    workingBranchResult.name,
    runCtx.inputs,
    runCtx.config,
  );
  logger.stepFinish(
    "Finished: Get associated pull requests",
  );

  logger.debugStepStart("Starting: Export base operation variables");
  await exportBaseOperationVariables(provider, {
    triggerContext,
    workingBranchResult,
    prForCommit: associatedPrForCommit,
    prFromBranch: associatedPrFromBranch,
    rawInputs: runCtx.rawInputs,
    inputs: runCtx.inputs,
    rawConfig: runCtx.rawConfig,
    config: runCtx.config,
  });
  logger.debugStepFinish("Finished: Export base operation variables");

  logger.stepStart("Starting: Execute base pre commands");
  const preResult = await runCommandsOrThrow(runCtx.config.commandHook, "pre");
  if (preResult) {
    logger.stepFinish(`Finished: Execute base pre commands. ${preResult}`);
  } else {
    logger.stepSkip("Skipped: Execute base pre commands (empty)");
  }

  logger.stepStart(
    "Starting: Resolve runtime config override (base pre commands)",
  );
  const _basePreRuntimeConfigResult = await resolveRuntimeConfigOverrideOrThrow(
    runCtx.rawConfig,
    runCtx.config,
    runCtx.inputs.workspacePath,
  );
  if (_basePreRuntimeConfigResult) {
    runCtx.rawConfig = _basePreRuntimeConfigResult.rawResolvedRuntime;
    runCtx.config = _basePreRuntimeConfigResult.resolvedRuntime;
    logger.stepFinish(
      "Finished: Resolve runtime config override (base pre commands)",
    );
  } else {
    logger.stepSkip(
      "Skipped: Resolve runtime config override (base pre commands)",
    );
  }

  // Main operation workflow
  if (!associatedPrForCommit) {
    logger.info(
      "Start Workflow: Create/Update release proposal pull request",
    );
    await proposeWorkflow(provider, {
      workingBranchResult,
      associatedPrFromBranch,
      triggerContext,
      runCtx,
    });
  } else {
    if (runCtx.config.release.enabled) {
      logger.info("Start Workflow: Create tag and release");
      await releaseWorkflow(provider, {
        triggerContext,
        associatedPrForCommit,
        runCtx,
      });
    } else {
      logger.info(
        "Skip Workflow: Create tag and release (disabled in config)",
      );
    }
  }

  logger.stepStart("Starting: Execute base post commands");
  const postResult = await runCommandsOrThrow(
    runCtx.config.commandHook,
    "post",
  );
  if (postResult) {
    logger.stepFinish(`Finished: Execute base post commands. ${postResult}`);
  } else {
    logger.stepSkip("Skipped: Execute base post commands (empty)");
  }
}
