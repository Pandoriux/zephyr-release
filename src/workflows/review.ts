import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { logger } from "../tasks/logger.ts";
import type {
  OperationRunContext,
  OperationTriggerContext,
} from "../types/operation-context.ts";
import type { WorkingBranchResult } from "../tasks/branch.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import { reviewProposeWorkflow } from "./review.propose.ts";
import { reviewReleaseWorkflow } from "./review.release.ts";

interface ReviewWorkflowOptions {
  workingBranchResult: WorkingBranchResult;
  associatedPrForCommit: ProviderPullRequest | undefined;
  associatedPrFromBranch: ProviderPullRequest | undefined;
  triggerContext: OperationTriggerContext;
}

export async function reviewWorkflow(
  provider: PlatformProvider,
  currentRunCtx: OperationRunContext,
  opts: ReviewWorkflowOptions,
): Promise<OperationRunContext> {
  const {
    workingBranchResult,
    associatedPrForCommit,
    associatedPrFromBranch,
    triggerContext,
  } = opts;

  /**
   * Review operation run context.
   */
  let runCtx: OperationRunContext = currentRunCtx;

  if (!associatedPrForCommit) {
    logger.info(
      "Review Workflow: Creating/Updating release proposal pull request...",
    );
    runCtx = await reviewProposeWorkflow(provider, {
      workingBranchResult,
      associatedPrFromBranch,
      triggerContext,
      currentRunCtx: runCtx,
    });
  } else if (runCtx.config.release.createTag) {
    logger.info("Review Workflow: Creating tag and release...");
    runCtx = await reviewReleaseWorkflow(provider, {
      associatedPrForCommit,
      currentRunCtx: runCtx,
    });
  } else {
    logger.info(
      "Review Workflow: Skip create tag and release (disabled in config)",
    );
  }

  return runCtx;
}
