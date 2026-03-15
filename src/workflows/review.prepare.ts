import { logger } from "../tasks/logger.ts";
import {
  commitChangesToBranch,
  prepareChangesToCommit,
  resolveCommitsFromTriggerToLastRelease,
} from "../tasks/commit.ts";
import { createOrUpdatePullRequestOrThrow } from "../tasks/pull-request.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { format } from "@std/semver";
import { calculateNextVersion } from "../tasks/calculate-next-version/calculate-version.ts";
import { getPreviousVersion } from "../tasks/calculate-next-version/previous-version.ts";
import {
  createDynamicChangelogStringPatternContext,
  createFixedPreviousVersionStringPatternContext,
  createFixedVersionStringPatternContext,
} from "../tasks/string-templates-and-patterns/pattern-context.ts";
import { generateChangelogReleaseContent } from "../tasks/changelog.ts";
import { runCommandsOrThrow } from "../tasks/command.ts";
import { resolveRuntimeConfigOverrideOrThrow } from "../tasks/configs/config.ts";
import {
  exportPostPrepareOperationVariables,
  exportPrePrepareOperationVariables,
} from "../tasks/export-variables.ts";
import type { OperationRunSettings } from "../types/operation-context.ts";
import { addLabelsToPullRequestOrThrow } from "../tasks/label.ts";
import type { BootstrapResult } from "./bootstrap.ts";

export async function executeReviewPreparePhase(
  provider: PlatformProvider,
  currentRunSettings: OperationRunSettings,
  bootstrapData: BootstrapResult,
): Promise<OperationRunSettings> {
  const {
    workingBranchResult,
    associatedPrFromBranch,
    triggerContext,
  } = bootstrapData;

  /**
   * Prepare phase run settings.
   */
  let runSettings: OperationRunSettings = currentRunSettings;

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

  // TODO, if next version = prev, exit

  logger.debugStepStart(
    "Starting: Create fixed version and previous version string pattern context",
  );
  createFixedPreviousVersionStringPatternContext(previousVersion);
  await createFixedVersionStringPatternContext(
    nextVersion,
    runSettings.config.release.tagNameTemplate,
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

  logger.stepStart("Starting: Execute pull request pre commands");
  const preResult = await runCommandsOrThrow(
    runSettings.config.commandHooks.prepare,
    "pre",
  );
  if (preResult) {
    logger.stepFinish(
      `Finished: Execute pull request pre commands. ${preResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute pull request pre commands (empty)");
  }

  logger.stepStart(
    "Starting: Resolve runtime config override (pull request pre commands)",
  );
  const _prPreRuntimeConfigResult = await resolveRuntimeConfigOverrideOrThrow(
    runSettings.rawConfig,
    runSettings.config,
    runSettings.inputs.workspacePath,
  );
  if (_prPreRuntimeConfigResult) {
    runSettings = {
      ...runSettings,
      rawConfig: _prPreRuntimeConfigResult.rawResolvedRuntime,
      config: _prPreRuntimeConfigResult.resolvedRuntime,
    };
    logger.stepFinish(
      "Finished: Resolve runtime config override (pull request pre commands)",
    );
  } else {
    logger.stepSkip(
      "Skipped: Resolve runtime config override (pull request pre commands)",
    );
  }

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
  const _commitResult = await commitChangesToBranch(
    provider,
    runSettings.inputs,
    runSettings.config,
    {
      triggerCommitHash: runSettings.inputs.triggerCommitHash,
      baseTreeHash: triggerContext.latestTriggerCommit.treeHash,
      changesToCommit: changesData,
      targetBranchName: workingBranchResult.name,
      force: true,
    },
  );
  logger.stepFinish("Finished: Commit changes");

  logger.stepStart("Starting: Create or update pull request");
  const prNumber = await createOrUpdatePullRequestOrThrow(
    provider,
    {
      workingBranchName: workingBranchResult.name,
      triggerBranchName: runSettings.inputs.triggerBranchName,
      associatedPrFromBranch,
    },
    runSettings.inputs,
    runSettings.config,
  );
  logger.stepFinish("Finished: Create or update pull request");

  logger.stepStart("Starting: Add labels to pull request");
  await addLabelsToPullRequestOrThrow(provider, prNumber, runSettings.config);
  logger.stepFinish("Finished: Add labels to pull request");

  logger.debugStepStart("Starting: Export post prepare operation variables");
  await exportPostPrepareOperationVariables(provider, prNumber, changesData);
  logger.debugStepFinish("Finished: Export post prepare operation variables");

  logger.stepStart("Starting: Execute pull request post commands");
  const postResult = await runCommandsOrThrow(
    runSettings.config.commandHooks.prepare,
    "post",
  );
  if (postResult) {
    logger.stepFinish(
      `Finished: Execute pull request post commands. ${postResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute pull request post commands (empty)");
  }

  logger.stepStart(
    "Starting: Resolve runtime config override (pull request post commands)",
  );
  const _prPostRuntimeConfigResult = await resolveRuntimeConfigOverrideOrThrow(
    runSettings.rawConfig,
    runSettings.config,
    runSettings.inputs.workspacePath,
  );
  if (_prPostRuntimeConfigResult) {
    runSettings = {
      ...runSettings,
      rawConfig: _prPostRuntimeConfigResult.rawResolvedRuntime,
      config: _prPostRuntimeConfigResult.resolvedRuntime,
    };
    logger.stepFinish(
      "Finished: Resolve runtime config override (pull request post commands)",
    );
  } else {
    logger.stepSkip(
      "Skipped: Resolve runtime config override (pull request post commands)",
    );
  }

  return runSettings;
}
