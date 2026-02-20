import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import { runCommandsOrThrow } from "../tasks/command.ts";
import {
  exportPostReleaseOperationVariables,
  exportPreReleaseOperationVariables,
} from "../tasks/export-variables.ts";
import { logger } from "../tasks/logger.ts";
import { extractChangelogFromPr } from "../tasks/pull-request.ts";
import { createRelease } from "../tasks/release.ts";
import {
  createDynamicChangelogStringPatternContext,
  createFixedVersionStringPatternContext,
} from "../tasks/string-templates-and-patterns/pattern-context.ts";
import { createTagOrThrow } from "../tasks/tag.ts";
import {
  getPrimaryVersionFile,
  getVersionSemVerFromVersionFile,
} from "../tasks/version-files/version-file.ts";
import type { OperationTriggerContext } from "../types/operation-context.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import type { ProviderRelease } from "../types/providers/release.ts";

interface ReleaseWorkflowOptions {
  operationContext: OperationTriggerContext;
  associatedPrForCommit: ProviderPullRequest;
  inputs: InputsOutput;
  config: ConfigOutput;
}

export async function releaseWorkflow(
  provider: PlatformProvider,
  ops: ReleaseWorkflowOptions,
) {
  const { operationContext, associatedPrForCommit, inputs, config } = ops;

  logger.stepStart("Starting: Extract changelog from pull request body");
  const prChangelogRelease = extractChangelogFromPr(associatedPrForCommit);
  logger.stepFinish("Finished: Extract changelog from pull request body");

  logger.stepStart("Starting: Extract version from primary version file");
  const primaryVersionFile = getPrimaryVersionFile(config.versionFiles);
  const version = await getVersionSemVerFromVersionFile(
    primaryVersionFile,
    inputs.sourceMode,
    provider,
    inputs.workspacePath,
    inputs.triggerCommitHash,
  );
  if (!version) {
    throw new Error("Failed to extract version from primary version file");
  }
  logger.stepFinish(
    "Finished: Extract version from primary version file",
  );

  logger.debugStepStart(
    "Starting: Create fixed version string pattern context",
  );
  await createFixedVersionStringPatternContext(
    version,
    config.release.tagNameTemplate,
  );
  logger.debugStepFinish(
    "Finished: Create fixed version string pattern context",
  );

  logger.debugStepStart(
    "Starting: Create dynamic changelog string pattern contextt",
  );
  createDynamicChangelogStringPatternContext(prChangelogRelease);
  logger.debugStepFinish(
    "Finished: Create dynamic changelog string pattern contextt",
  );

  logger.debugStepStart("Starting: Export pre release operation variables");
  await exportPreReleaseOperationVariables(
    provider,
    associatedPrForCommit.number,
    version,
  );
  logger.debugStepFinish("Finished: Export pre release operation variables");

  logger.stepStart("Starting: Execute release pre commands");
  const preResult = await runCommandsOrThrow(
    config.release.commandHook,
    "pre",
  );
  if (preResult) {
    logger.stepFinish(
      `Finished: Execute release pre commands. ${preResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute release pre commands (empty)");
  }

  logger.stepStart("Starting: Create tag");
  const createdTag = await createTagOrThrow(provider, inputs, config);
  logger.stepFinish("Finished: Create tag");

  logger.stepStart("Starting: Create release");
  let createdReleaseNote: ProviderRelease | undefined;
  if (!config.release.skipReleaseNote) {
    createdReleaseNote = await createRelease(provider, inputs, config);
    logger.stepFinish("Finished: Create release");
  } else {
    logger.stepSkip(
      "Skipped: Create release (config skip release note is true)",
    );
  }

  logger.debugStepStart("Starting: Export post release operation variables");
  await exportPostReleaseOperationVariables(
    provider,
    createdTag.hash,
    createdReleaseNote?.id,
    createdReleaseNote?.uploadUrl,
  );
  logger.debugStepFinish("Finished: Export post release operation variables");

  logger.stepStart("Starting: Execute release post commands");
  const postResult = await runCommandsOrThrow(
    config.release.commandHook,
    "post",
  );
  if (postResult) {
    logger.stepFinish(
      `Finished: Execute release post commands. ${postResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute release post commands (empty)");
  }
}
