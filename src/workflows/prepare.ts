import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { WorkingBranchResult } from "../tasks/branch.ts";
import { logger } from "../tasks/logger.ts";
import {
  commitChangesToBranch,
  prepareChangesToCommit,
  resolveCommitsFromTriggerToLastRelease,
} from "../tasks/commit.ts";
import { createOrUpdatePullRequestOrThrow } from "../tasks/pull-request.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { calculateNextVersion } from "../tasks/calculate-next-version/next-version.ts";
import {
  createDynamicChangelogStringPatternContext,
  createFixedVersionStringPatternContext,
} from "../tasks/string-templates-and-patterns/pattern-context.ts";
import { generateChangelogReleaseContent } from "../tasks/changelog.ts";
import { runCommandsOrThrow } from "../tasks/command.ts";
import {
  exportPostPrepareOperationVariables,
  exportPrePrepareOperationVariables,
} from "../tasks/export-variables.ts";
import type { OperationTriggerContext } from "../types/operation-context.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import { addLabelsToPullRequestOrThrow } from "../tasks/label.ts";

interface PrepareWorkflowOptions {
  workingBranchResult: WorkingBranchResult;
  associatedPrFromBranch: ProviderPullRequest | undefined;
  operationContext: OperationTriggerContext;
  inputs: InputsOutput;
  config: ConfigOutput;
}

export async function prepareWorkflow(
  provider: PlatformProvider,
  ops: PrepareWorkflowOptions,
) {
  const {
    workingBranchResult,
    associatedPrFromBranch,
    operationContext,
    inputs,
    config,
  } = ops;

  logger.stepStart("Starting: Resolve commits from trigger to last release");
  const resolvedCommitsResult = await resolveCommitsFromTriggerToLastRelease(
    provider,
    inputs,
    config,
  );
  logger.stepFinish("Finished: Resolve commits from trigger to last release");

  logger.stepStart("Starting: Calculate next version");
  const nextVersionResult = await calculateNextVersion(
    provider,
    resolvedCommitsResult,
    inputs,
    config,
  );
  logger.stepFinish("Finished: Calculate next version");

  logger.debugStepStart(
    "Starting: Create fixed version string pattern context",
  );
  createFixedVersionStringPatternContext(
    nextVersionResult.nextVerSemVer,
    config.release.tagNameTemplate,
  );
  logger.debugStepFinish(
    "Finished: Create fixed version string pattern context",
  );

  logger.debugStepStart("Starting: Export pre prepare operation variables");
  await exportPrePrepareOperationVariables(
    provider,
    resolvedCommitsResult.entries,
    nextVersionResult,
  );
  logger.debugStepFinish("Finished: Export pre prepare operation variables");

  logger.stepStart("Starting: Execute pull request pre commands");
  const preResult = await runCommandsOrThrow(
    config.pullRequest.commandHook,
    "pre",
  );
  if (preResult) {
    logger.stepFinish(
      `Finished: Execute pull request pre commands. ${preResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute pull request pre commands (empty)");
  }

  logger.stepStart("Starting: Generate changelog release content");
  const changelogReleaseResult = await generateChangelogReleaseContent(
    provider,
    resolvedCommitsResult.entries,
    inputs,
    config,
  );
  logger.stepFinish("Finished: Generate changelog release content");

  logger.debugStepStart(
    "Starting: Create dynamic changelog string pattern context",
  );
  createDynamicChangelogStringPatternContext(changelogReleaseResult);
  logger.debugStepFinish(
    "Finished: Create dynamic changelog string pattern context",
  );

  logger.stepStart("Starting: Prepare and collect changes data to commit");
  const changesData = await prepareChangesToCommit(
    provider,
    inputs,
    config,
    {
      changelogRelease: changelogReleaseResult.release,
      nextVersion: nextVersionResult.nextVerStr,
    },
  );
  logger.stepFinish("Finished: Prepare and collect changes data to commit");

  logger.stepStart("Starting: Commit changes");
  const _commitResult = await commitChangesToBranch(provider, {
    triggerCommitHash: inputs.triggerCommitHash,
    baseTreeHash: operationContext.latestTriggerCommit.treeHash,
    changesToCommit: changesData,
    workingBranchName: workingBranchResult.name,
  }, {
    pullRequest: {
      titleTemplate: config.pullRequest.titleTemplate,
      titleTemplatePath: config.pullRequest.titleTemplatePath,
    },
  });
  logger.stepFinish("Finished: Commit changes");

  logger.stepStart("Starting: Create or update pull request");
  const prNumber = await createOrUpdatePullRequestOrThrow(
    provider,
    {
      workingBranchName: workingBranchResult.name,
      triggerBranchName: inputs.triggerBranchName,
      associatedPrFromBranch,
    },
    inputs,
    config,
  );
  logger.stepFinish("Finished: Create or update pull request");

  logger.stepStart("Starting: Add labels to pull request");
  await addLabelsToPullRequestOrThrow(provider, prNumber, config);
  logger.stepFinish("Finished: Add labels to pull request");

  logger.debugStepStart("Starting: Export post prepare operation variables");
  await exportPostPrepareOperationVariables(provider, prNumber, changesData);
  logger.debugStepFinish("Finished: Export post prepare operation variables");

  logger.stepStart("Starting: Execute pull request post commands");
  const postResult = await runCommandsOrThrow(
    config.pullRequest.commandHook,
    "post",
  );
  if (postResult) {
    logger.stepFinish(
      `Finished: Execute pull request post commands. ${postResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute pull request post commands (empty)");
  }
}
