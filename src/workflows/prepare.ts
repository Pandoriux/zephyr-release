import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import { setupWorkingBranchOrThrow } from "../tasks/branch.ts";
import { logger } from "../tasks/logger.ts";
import { resolveCommitsFromTriggerToLastRelease } from "../tasks/commit.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { BaseStringPatternContext } from "../types/string-patterns.ts";
import { calculateNextVersion } from "../tasks/next-version.ts";

interface PrepareWorkflowOptions {
  inputs: InputsOutput;
  config: ConfigOutput;
  baseStringPatternCtx: BaseStringPatternContext;
}

export async function prepareWorkflow(
  provider: PlatformProvider,
  ops: PrepareWorkflowOptions,
) {
  const {
    inputs,
    config,
    baseStringPatternCtx,
  } = ops;

  logger.stepStart("Starting: Ensure working branch is prepared");
  const workBranch = await setupWorkingBranchOrThrow(
    provider,
    baseStringPatternCtx,
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
  const nextVersion = await calculateNextVersion(resolvedCommitsResult, config);
  logger.stepFinish("Finished: Calculate next version");
}
