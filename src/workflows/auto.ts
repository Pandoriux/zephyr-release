import { format } from "@std/semver";
import type { WorkingBranchResult } from "../tasks/branch.ts";
import {
  calculateNextVersion,
  compareVersionToPreviousVersionOrExit,
} from "../tasks/calculate-next-version/calculate-version.ts";
import { getPreviousVersion } from "../tasks/calculate-next-version/previous-version.ts";
import { generateChangelogReleaseContent } from "../tasks/changelog.ts";
import { runCommandsOrThrow } from "../tasks/command.ts";
import {
  commitChangesToBranchOrThrow,
  prepareChangesToCommit,
  resolveCommitsFromTriggerToLastRelease,
} from "../tasks/commit.ts";
import { resolveRuntimeConfigOverrideOrThrow } from "../tasks/configs/config.ts";
import {
  exportPostPrepareOperationVariables,
  exportPrePrepareOperationVariables,
  exportPrePublishOperationVariables,
} from "../tasks/export-variables.ts";
import { logger } from "../tasks/logger.ts";
import {
  createCustomStringPatternContext,
  createDynamicChangelogStringPatternContext,
  createFixedPreviousVersionStringPatternContext,
  createFixedVersionStringPatternContext,
} from "../tasks/string-templates-and-patterns/pattern-context.ts";
import type {
  OperationRunSettings,
  OperationTriggerContext,
} from "../types/operation-context.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderProposal } from "../types/providers/proposal.ts";
import { evaluateAutoModeTriggerStrategyOrExit } from "../tasks/auto-trigger-strategy.ts";
import { createTagOrThrow } from "../tasks/tag.ts";

interface AutoWorkflowOptions {
  workingBranchResult: WorkingBranchResult;
  associatedProposalForCommit: ProviderProposal | undefined;
  associatedProposalFromBranch: ProviderProposal | undefined;
  triggerContext: OperationTriggerContext;
}

export async function executeAutoStrategy(
  provider: PlatformProvider,
  currentRunSettings: OperationRunSettings,
  opts: AutoWorkflowOptions,
) {
  const {
    // workingBranchResult,
    // associatedProposalForCommit,
    // associatedProposalFromBranch,
    triggerContext,
  } = opts;

  /**
   * Auto mode run settings.
   */
  let runSettings: OperationRunSettings = currentRunSettings;

  logger.subHeader("Auto mode execution (prepare): Creating commit...");

  logger.stepStart("Starting: Get previous version");
  const previousVersion = await getPreviousVersion(
    provider,
    runSettings.inputs,
    runSettings.config,
  );
  logger.stepFinish("Finished: Get previous version");

  logger.stepStart("Starting: Resolve commits from trigger to last release");
  const resolvedCommitsResult = await resolveCommitsFromTriggerToLastRelease(
    provider,
    runSettings.inputs,
    runSettings.config,
  );
  logger.stepFinish("Finished: Resolve commits from trigger to last release");

  logger.stepStart("Starting: Calculate next version");
  const nextVersion = calculateNextVersion(
    resolvedCommitsResult,
    runSettings.config,
    previousVersion,
  );
  logger.stepFinish("Finished: Calculate next version");

  logger.stepStart(
    "Starting: Compare calculated next version with previous version",
  );
  compareVersionToPreviousVersionOrExit(
    nextVersion,
    previousVersion,
  );
  logger.stepFinish(
    "Finished: Compare calculated next version with previous version",
  );

  logger.debugStepStart(
    "Starting: Create fixed version and previous version string pattern context",
  );
  createFixedPreviousVersionStringPatternContext(previousVersion);
  await createFixedVersionStringPatternContext(
    nextVersion,
    runSettings.config.tag.nameTemplate,
  );
  logger.debugStepFinish(
    "Finished: Create fixed version string pattern context",
  );

  logger.debugStepStart("Starting: Export pre prepare operation variables");
  await exportPrePrepareOperationVariables(
    provider,
    resolvedCommitsResult.entries,
    previousVersion,
    nextVersion,
  );
  logger.debugStepFinish("Finished: Export pre prepare operation variables");

  logger.stepStart("Starting: Execute prepare pre commands");
  const preResult = await runCommandsOrThrow(
    runSettings.config.commandHooks.prepare,
    "pre",
  );
  if (preResult) {
    logger.stepFinish(
      `Finished: Execute prepare pre commands. ${preResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute prepare pre commands (empty)");
  }

  logger.stepStart(
    "Starting: Resolve runtime config override (prepare pre commands)",
  );
  const _preparePreRuntimeConfigResult =
    await resolveRuntimeConfigOverrideOrThrow(
      runSettings.rawConfig,
      runSettings.config,
      runSettings.inputs.workspacePath,
    );
  if (_preparePreRuntimeConfigResult) {
    runSettings = {
      ...runSettings,
      rawConfig: _preparePreRuntimeConfigResult.rawResolvedRuntime,
      config: _preparePreRuntimeConfigResult.resolvedRuntime,
    };
    createCustomStringPatternContext(runSettings.config.customStringPatterns);
    logger.stepFinish(
      "Finished: Resolve runtime config override (prepare pre commands)",
    );
  } else {
    logger.stepSkip(
      "Skipped: Resolve runtime config override (prepare pre commands)",
    );
  }

  logger.stepStart("Starting: Evaluate auto mode trigger strategy");
  evaluateAutoModeTriggerStrategyOrExit(
    resolvedCommitsResult.entries,
    runSettings.config,
  );
  logger.stepFinish("Finished: Evaluate auto mode trigger strategy");

  logger.stepStart("Starting: Generate changelog release content");
  const changelogReleaseResult = await generateChangelogReleaseContent(
    provider,
    resolvedCommitsResult.entries,
    runSettings.inputs,
    runSettings.config,
  );
  logger.stepFinish("Finished: Generate changelog release content");

  logger.debugStepStart(
    "Starting: Create dynamic changelog string pattern context",
  );
  createDynamicChangelogStringPatternContext(
    changelogReleaseResult.release,
    changelogReleaseResult.releaseBody,
  );
  logger.debugStepFinish(
    "Finished: Create dynamic changelog string pattern context",
  );

  logger.stepStart("Starting: Prepare and collect changes data to commit");
  const changesData = await prepareChangesToCommit(
    provider,
    runSettings.inputs,
    runSettings.config,
    {
      changelogRelease: changelogReleaseResult.release,
      nextVersion: format(nextVersion),
    },
  );
  logger.stepFinish("Finished: Prepare and collect changes data to commit");

  logger.stepStart("Starting: Commit changes");
  const commitResult = await commitChangesToBranchOrThrow(
    provider,
    runSettings.inputs,
    runSettings.config,
    {
      baseTreeHash: triggerContext.latestTriggerCommit.treeHash,
      changesToCommit: changesData,
      targetBranchName: runSettings.inputs.triggerBranchName,
      force: false,
    },
  );
  logger.stepFinish("Finished: Commit changes");

  logger.debugStepStart("Starting: Export post prepare operation variables");
  await exportPostPrepareOperationVariables(
    provider,
    commitResult.hash,
    changesData,
    {
      config: runSettings.config,
    },
  );
  logger.debugStepFinish("Finished: Export post prepare operation variables");

  logger.stepStart("Starting: Execute prepare post commands");
  const postResult = await runCommandsOrThrow(
    runSettings.config.commandHooks.prepare,
    "post",
  );
  if (postResult) {
    logger.stepFinish(
      `Finished: Execute prepare post commands. ${postResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute prepare post commands (empty)");
  }

  logger.stepStart(
    "Starting: Resolve runtime config override (prepare post commands)",
  );
  const _preparePostRuntimeConfigResult =
    await resolveRuntimeConfigOverrideOrThrow(
      runSettings.rawConfig,
      runSettings.config,
      runSettings.inputs.workspacePath,
    );
  if (_preparePostRuntimeConfigResult) {
    runSettings = {
      ...runSettings,
      rawConfig: _preparePostRuntimeConfigResult.rawResolvedRuntime,
      config: _preparePostRuntimeConfigResult.resolvedRuntime,
    };
    createCustomStringPatternContext(runSettings.config.customStringPatterns);
    logger.stepFinish(
      "Finished: Resolve runtime config override (prepare post commands)",
    );
  } else {
    logger.stepSkip(
      "Skipped: Resolve runtime config override (prepare post commands)",
    );
  }

  /////////////////////

  if (runSettings.config.tag.createTag) {
    logger.subHeader(
      "Auto mode execution (publish): Creating tag and release...",
    );

    logger.debugStepStart("Starting: Export pre publish operation variables");
    await exportPrePublishOperationVariables(provider, nextVersion);
    logger.debugStepFinish("Finished: Export pre publish operation variables");

    logger.stepStart("Starting: Execute publish pre commands");
    const preResult = await runCommandsOrThrow(
      runSettings.config.commandHooks.publish,
      "pre",
    );
    if (preResult) {
      logger.stepFinish(
        `Finished: Execute publish pre commands. ${preResult}`,
      );
    } else {
      logger.stepSkip("Skipped: Execute publish pre commands (empty)");
    }

    logger.stepStart(
      "Starting: Resolve runtime config override (publish pre commands)",
    );
    const _releasePreRuntimeConfigResult =
      await resolveRuntimeConfigOverrideOrThrow(
        runSettings.rawConfig,
        runSettings.config,
        runSettings.inputs.workspacePath,
      );
    if (_releasePreRuntimeConfigResult) {
      runSettings = {
        ...runSettings,
        rawConfig: _releasePreRuntimeConfigResult.rawResolvedRuntime,
        config: _releasePreRuntimeConfigResult.resolvedRuntime,
      };
      createCustomStringPatternContext(runSettings.config.customStringPatterns);
      logger.stepFinish(
        "Finished: Resolve runtime config override (publish pre commands)",
      );
    } else {
      logger.stepSkip(
        "Skipped: Resolve runtime config override (publish pre commands)",
      );
    }

    logger.stepStart("Starting: Create tag");
    const createdTag = await createTagOrThrow(
      provider,
      commitResult.hash,
      runSettings.inputs,
      runSettings.config,
    );
    logger.stepFinish("Finished: Create tag");
  } else {
    logger.subHeader(
      "Auto mode execution (publish): Skip create tag and release (disabled in config)",
    );
  }

  // based on auto release strategy, evalute we should continue? orexit
  // const result = valuateAutoreleaseStrategy()

  // const changelogReleaseResult = await generateChangelogReleaseContent(

  // const changesData = await prepareChangesToCommit(

  // const _commitResult = await commitChangesToBranch(

  // then create tag? release? attach release?

  return runSettings;
}
