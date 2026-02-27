import { runCommandsOrThrow } from "../tasks/command.ts";
import { resolveRuntimeConfigOverrideOrThrow } from "../tasks/configs/config.ts";
import {
  exportPostReleaseOperationVariables,
  exportPreReleaseOperationVariables,
} from "../tasks/export-variables.ts";
import { updateMergedPullRequestLabelsOrThrow } from "../tasks/label.ts";
import { logger } from "../tasks/logger.ts";
import { extractChangelogFromPr } from "../tasks/pull-request.ts";
import { attachReleaseAssets, createRelease } from "../tasks/release.ts";
import {
  createDynamicChangelogStringPatternContext,
  createFixedVersionStringPatternContext,
} from "../tasks/string-templates-and-patterns/pattern-context.ts";
import { createTagOrThrow } from "../tasks/tag.ts";
import {
  getPrimaryVersionFile,
  getVersionSemVerFromVersionFile,
} from "../tasks/version-files/version-file.ts";
import type {
  OperationRunContext,
  OperationTriggerContext,
} from "../types/operation-context.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import type { ProviderRelease } from "../types/providers/release.ts";

interface ReleaseWorkflowOptions {
  triggerContext: OperationTriggerContext;
  associatedPrForCommit: ProviderPullRequest;
  runCtx: OperationRunContext;
}

export async function releaseWorkflow(
  provider: PlatformProvider,
  opts: ReleaseWorkflowOptions,
) {
  const {
    triggerContext,
    associatedPrForCommit,
    runCtx,
  } = opts;

  logger.stepStart("Starting: Extract changelog from pull request body");
  const prChangelogRelease = extractChangelogFromPr(associatedPrForCommit);
  logger.stepFinish("Finished: Extract changelog from pull request body");

  logger.stepStart("Starting: Extract version from primary version file");
  const primaryVersionFile = getPrimaryVersionFile(runCtx.config.versionFiles);
  const version = await getVersionSemVerFromVersionFile(
    primaryVersionFile,
    runCtx.inputs.sourceMode,
    provider,
    runCtx.inputs.workspacePath,
    runCtx.inputs.triggerCommitHash,
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
    runCtx.config.release.tagNameTemplate,
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
    runCtx.config.release.commandHook,
    "pre",
  );
  if (preResult) {
    logger.stepFinish(
      `Finished: Execute release pre commands. ${preResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute release pre commands (empty)");
  }

  logger.stepStart(
    "Starting: Resolve runtime config override (release pre commands)",
  );
  const _releasePreRuntimeConfigResult =
    await resolveRuntimeConfigOverrideOrThrow(
      runCtx.rawConfig,
      runCtx.config,
      runCtx.inputs.workspacePath,
    );
  if (_releasePreRuntimeConfigResult) {
    runCtx.rawConfig = _releasePreRuntimeConfigResult.rawResolvedRuntime;
    runCtx.config = _releasePreRuntimeConfigResult.resolvedRuntime;
    logger.stepFinish(
      "Finished: Resolve runtime config override (release pre commands)",
    );
  } else {
    logger.stepSkip(
      "Skipped: Resolve runtime config override (release pre commands)",
    );
  }

  logger.stepStart("Starting: Create tag");
  const createdTag = await createTagOrThrow(
    provider,
    runCtx.inputs,
    runCtx.config,
  );
  logger.stepFinish("Finished: Create tag");

  logger.stepStart("Starting: Create release");
  let createdReleaseNote: ProviderRelease | undefined;
  if (!runCtx.config.release.skipReleaseNote) {
    createdReleaseNote = await createRelease(
      provider,
      runCtx.inputs,
      runCtx.config,
    );
    logger.stepFinish("Finished: Create release");
  } else {
    logger.stepSkip(
      "Skipped: Create release (config skip release note is true)",
    );
  }

  logger.stepStart("Starting: Attach release assets");
  if (createdReleaseNote?.id && runCtx.config.release.assets) {
    await attachReleaseAssets(
      provider,
      createdReleaseNote.id,
      runCtx.config.release.assets,
    );
    logger.stepFinish("Finished: Attach release assets");
  } else {
    logger.stepSkip(
      "Skipped: Attach release assets (no assets to attach or config skip release note is true)",
    );
  }

  logger.stepStart("Starting: Update merged pull request labels");
  await updateMergedPullRequestLabelsOrThrow(
    provider,
    associatedPrForCommit.number,
    runCtx.config,
  );
  logger.stepFinish("Finished: Update merged pull request labels");

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
    runCtx.config.release.commandHook,
    "post",
  );
  if (postResult) {
    logger.stepFinish(
      `Finished: Execute release post commands. ${postResult}`,
    );
  } else {
    logger.stepSkip("Skipped: Execute release post commands (empty)");
  }

  logger.stepStart(
    "Starting: Resolve runtime config override (release post commands)",
  );
  const _releasePostRuntimeConfigResult =
    await resolveRuntimeConfigOverrideOrThrow(
      runCtx.rawConfig,
      runCtx.config,
      runCtx.inputs.workspacePath,
    );
  if (_releasePostRuntimeConfigResult) {
    runCtx.rawConfig = _releasePostRuntimeConfigResult.rawResolvedRuntime;
    runCtx.config = _releasePostRuntimeConfigResult.resolvedRuntime;
    logger.stepFinish(
      "Finished: Resolve runtime config override (release post commands)",
    );
  } else {
    logger.stepSkip(
      "Skipped: Resolve runtime config override (release post commands)",
    );
  }
}
