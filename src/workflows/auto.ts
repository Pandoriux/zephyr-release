import type { WorkingBranchResult } from "../tasks/branch.ts";
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

  return runCtx;
}
