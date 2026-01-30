import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import { setupWorkingBranchOrThrow } from "../tasks/branch.ts";
import { logger } from "../tasks/logger.ts";
import { resolveCommitsFromTriggerToLastRelease } from "../tasks/commit.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { calculateNextVersion } from "../tasks/calculate-next-version/next-version.ts";
import { createFixedVersionStringPatternContext } from "../tasks/string-templates-and-patterns/pattern-context.ts";
import { generateChangelogReleaseContent } from "../tasks/changelog.ts";
import { runCommandsOrThrow } from "../tasks/command.ts";

interface PrepareWorkflowOptions {
  inputs: InputsOutput;
  config: ConfigOutput;
}

export async function prepareWorkflow(
  provider: PlatformProvider,
  ops: PrepareWorkflowOptions,
) {
  const { inputs, config } = ops;

  logger.stepStart("Starting: Ensure working branch is prepared");
  const workBranch = await setupWorkingBranchOrThrow(
    provider,
    inputs,
    config,
  );
  logger.stepFinish("Finished: Ensure working branch is prepared");

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
}
