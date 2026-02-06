import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { WorkingBranchResult } from "../tasks/branch.ts";
import { logger } from "../tasks/logger.ts";
import {
  commitChangesToBranch,
  prepareChangesToCommit,
  resolveCommitsFromTriggerToLastRelease,
} from "../tasks/commit.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { calculateNextVersion } from "../tasks/calculate-next-version/next-version.ts";
import { createFixedVersionStringPatternContext } from "../tasks/string-templates-and-patterns/pattern-context.ts";
import { generateChangelogReleaseContent } from "../tasks/changelog.ts";
import { runCommandsOrThrow } from "../tasks/command.ts";
import { exportPrePrepareOperationVariables } from "../tasks/export-variables.ts";

interface PrepareWorkflowOptions {
  workingBranchResult: WorkingBranchResult;
  inputs: InputsOutput;
  config: ConfigOutput;
}

export async function prepareWorkflow(
  provider: PlatformProvider,
  ops: PrepareWorkflowOptions,
) {
  const { workingBranchResult, associatedPrFromBranch, inputs, config } = ops;

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
    nextVersionResult.semver,
    config.release.tagNameTemplate,
  );
  logger.debugStepFinish(
    "Finished: Create fixed version string pattern context",
  );

  logger.debugStepStart("Starting: Export pre prepare operation variables");
  await exportPrePrepareOperationVariables(
    provider,
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
  const changelogRelease = await generateChangelogReleaseContent(
    provider,
    resolvedCommitsResult.entries,
    inputs,
    config,
  );
  logger.stepFinish("Finished: Generate changelog release content");

  logger.stepStart("Starting: Prepare and collect changes data to commit");
  const changesData = await prepareChangesToCommit(
    provider,
    inputs,
    config,
    { changelogRelease, nextVersion: nextVersionResult.str },
  );
  logger.stepFinish("Finished: Prepare and collect changes data to commit");

  logger.stepStart("Starting: Commit changes and create pull request");
  const commitResult = await commitChangesToBranch(provider, {});
  logger.stepFinish("Finished: Commit changes and create pull request");

  // run post cmds
}
