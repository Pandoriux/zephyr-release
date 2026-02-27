import type { WorkingBranchResult } from "../tasks/branch.ts";
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
  exportPostProposeOperationVariables,
  exportPreProposeOperationVariables,
} from "../tasks/export-variables.ts";
import type {
  OperationRunContext,
  OperationTriggerContext,
} from "../types/operation-context.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import { addLabelsToPullRequestOrThrow } from "../tasks/label.ts";

interface ProposeWorkflowOptions {
  workingBranchResult: WorkingBranchResult;
  associatedPrFromBranch: ProviderPullRequest | undefined;
  triggerContext: OperationTriggerContext;
  currentRunCtx: OperationRunContext;
}

export async function proposeWorkflow(
  provider: PlatformProvider,
  opts: ProposeWorkflowOptions,
): Promise<OperationRunContext> {
  const {
    workingBranchResult,
    associatedPrFromBranch,
    triggerContext,
    currentRunCtx,
  } = opts;

  /**
   * Propose-specific operation run context.
   */
  let runCtx: OperationRunContext = currentRunCtx;

  logger.stepStart("Starting: Get previous version");
  const previousVersion = await getPreviousVersion(
    provider,
    runCtx.inputs,
    runCtx.config,
  );
  logger.stepFinish("Finished: Get previous version");

  logger.stepStart("Starting: Resolve commits from trigger to last release");
  const resolvedCommitsResult = await resolveCommitsFromTriggerToLastRelease(
    provider,
    runCtx.inputs,
    runCtx.config,
  );
  logger.stepFinish("Finished: Resolve commits from trigger to last release");

  logger.stepStart("Starting: Calculate next version");
  const nextVersion = calculateNextVersion(
    resolvedCommitsResult,
    runCtx.config,
    previousVersion,
  );
  logger.stepFinish("Finished: Calculate next version");

  logger.debugStepStart(
    "Starting: Create fixed version and previous version string pattern context",
  );
  createFixedPreviousVersionStringPatternContext(previousVersion);
  await createFixedVersionStringPatternContext(
    nextVersion,
    runCtx.config.release.tagNameTemplate,
  );
  logger.debugStepFinish(
    "Finished: Create fixed version string pattern context",
  );

  logger.debugStepStart("Starting: Export pre propose operation variables");
  await exportPreProposeOperationVariables(
    provider,
    resolvedCommitsResult.entries,
    previousVersion,
    nextVersion,
  );
  logger.debugStepFinish("Finished: Export pre propose operation variables");

  logger.stepStart("Starting: Execute pull request pre commands");
  const preResult = await runCommandsOrThrow(
    runCtx.config.pullRequest.commandHook,
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
    runCtx.rawConfig,
    runCtx.config,
    runCtx.inputs.workspacePath,
  );
  if (_prPreRuntimeConfigResult) {
    runCtx = {
      ...runCtx,
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
    runCtx.inputs,
    runCtx.config,
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
    runCtx.inputs,
    runCtx.config,
    {
      changelogRelease: changelogReleaseResult.release,
      nextVersion: format(nextVersion),
    },
  );
  logger.stepFinish("Finished: Prepare and collect changes data to commit");

  logger.stepStart("Starting: Commit changes");
  const _commitResult = await commitChangesToBranch(provider, {
    triggerCommitHash: runCtx.inputs.triggerCommitHash,
    baseTreeHash: triggerContext.latestTriggerCommit.treeHash,
    changesToCommit: changesData,
    workingBranchName: workingBranchResult.name,
  }, {
    pullRequest: {
      titleTemplate: runCtx.config.pullRequest.titleTemplate,
      titleTemplatePath: runCtx.config.pullRequest.titleTemplatePath,
    },
  });
  logger.stepFinish("Finished: Commit changes");

  logger.stepStart("Starting: Create or update pull request");
  const prNumber = await createOrUpdatePullRequestOrThrow(
    provider,
    {
      workingBranchName: workingBranchResult.name,
      triggerBranchName: runCtx.inputs.triggerBranchName,
      associatedPrFromBranch,
    },
    runCtx.inputs,
    runCtx.config,
  );
  logger.stepFinish("Finished: Create or update pull request");

  logger.stepStart("Starting: Add labels to pull request");
  await addLabelsToPullRequestOrThrow(provider, prNumber, runCtx.config);
  logger.stepFinish("Finished: Add labels to pull request");

  logger.debugStepStart("Starting: Export post propose operation variables");
  await exportPostProposeOperationVariables(provider, prNumber, changesData);
  logger.debugStepFinish("Finished: Export post propose operation variables");

  logger.stepStart("Starting: Execute pull request post commands");
  const postResult = await runCommandsOrThrow(
    runCtx.config.pullRequest.commandHook,
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
    runCtx.rawConfig,
    runCtx.config,
    runCtx.inputs.workspacePath,
  );
  if (_prPostRuntimeConfigResult) {
    runCtx = {
      ...runCtx,
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

  return runCtx;
}
