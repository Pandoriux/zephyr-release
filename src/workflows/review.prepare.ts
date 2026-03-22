import { logger } from "../tasks/logger.ts";
import {
  commitChangesToBranchOrThrow,
  prepareChangesToCommit,
  resolveCommitsFromTriggerToLastRelease,
} from "../tasks/commit.ts";
import { createOrUpdateProposalOrThrow } from "../tasks/proposal.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { format } from "@std/semver";
import {
  calculateNextVersion,
  compareVersionToPreviousVersionOrExit,
} from "../tasks/calculate-next-version/calculate-version.ts";
import { getPreviousVersion } from "../tasks/calculate-next-version/previous-version.ts";
import {
  createCustomStringPatternContext,
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
import { addLabelsToProposalOrThrow } from "../tasks/label.ts";
import type { BootstrapResult } from "./bootstrap.ts";

export async function executeReviewPreparePhase(
  provider: PlatformProvider,
  currentRunSettings: OperationRunSettings,
  bootstrapData: BootstrapResult,
): Promise<OperationRunSettings> {
  const {
    workingBranchResult,
    associatedProposalFromBranch,
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
      targetBranchName: workingBranchResult.name,
      force: true,
    },
  );
  logger.stepFinish("Finished: Commit changes");

  logger.stepStart("Starting: Create or update proposal");
  const proposal = await createOrUpdateProposalOrThrow(
    provider,
    {
      workingBranchName: workingBranchResult.name,
      triggerBranchName: runSettings.inputs.triggerBranchName,
      associatedProposalFromBranch,
    },
    runSettings.inputs,
    runSettings.config,
  );
  logger.stepFinish("Finished: Create or update proposal");

  logger.stepStart("Starting: Add labels to proposal");
  await addLabelsToProposalOrThrow(provider, proposal.id, runSettings.config);
  logger.stepFinish("Finished: Add labels to proposal");

  logger.debugStepStart("Starting: Export post prepare operation variables");
  await exportPostPrepareOperationVariables(
    provider,
    commitResult.hash,
    changesData,
    {
      proposalId: proposal.id,
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

  return runSettings;
}
