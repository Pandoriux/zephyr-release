import type { WorkingBranchResult } from "../tasks/branch.ts";
import { logger } from "../tasks/logger.ts";
import type {
  OperationRunContext,
  OperationTriggerContext,
} from "../types/operation-context.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";

interface AutoWorkflowOptions {
  workingBranchResult: WorkingBranchResult;
  associatedPrForCommit: ProviderPullRequest | undefined;
  associatedPrFromBranch: ProviderPullRequest | undefined;
  triggerContext: OperationTriggerContext;
}

export async function autoWorkflow(
  provider: PlatformProvider,
  currentRunCtx: OperationRunContext,
  opts: AutoWorkflowOptions,
) {
  const {
    workingBranchResult,
    associatedPrForCommit,
    associatedPrFromBranch,
    triggerContext,
  } = opts;

  /**
   * Auto operation run context.
   */
  let runCtx: OperationRunContext = currentRunCtx;

  logger.info("Auto Workflow: Creating commit...");

  // pseudo code below ////////////////////

  // get prev verision
  // const previousVersion = await getPreviousVersion(

  // resolve commit
  // const resolvedCommitsResult = await resolveCommitsFromTriggerToLastRelease(

  // const nextVersion = calculateNextVersion(

  // TODO, if next version = prev, exit

  // NOW, here, should we export pre release var? or pre propse var? do we run pre pr cmd hook? or pre release cmd hook?
  // because our autorelease strategy have a flag option, hat should be set dynamically

  // based on auto release strategy, evalute we should continue? orexit
  // const result = valuateAutoreleaseStrategy()

  // const changelogReleaseResult = await generateChangelogReleaseContent(

  // const changesData = await prepareChangesToCommit(

  // const _commitResult = await commitChangesToBranch(

  // then create tag? release? attach release?

  return runCtx;
}
