import { taskLogger } from "./logger.ts";
import { resolveStringTemplate } from "./string-patterns/resolve-string-template.ts";
import type { CoreLabelOutput } from "../schemas/configs/modules/components/core-label.ts";
import type { PullRequestConfigOutput } from "../schemas/configs/modules/pull-request-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import type { BaseStringPatternContext } from "../types/string-patterns.ts";

type FindPrForCommitInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "token"
>;

interface PullRequestBranchAndLabelConfigParams {
  pullRequest: {
    branchNameTemplate: PullRequestConfigOutput["branchNameTemplate"];
    label: { onCreate: CoreLabelOutput["onCreate"] };
  };
}

export async function findPullRequestForCommitOrThrow(
  provider: PlatformProvider,
  strPatCtx: BaseStringPatternContext,
  inputs: FindPrForCommitInputsParams,
  config: PullRequestBranchAndLabelConfigParams,
): Promise<ProviderPullRequest | undefined> {
  const { triggerCommitHash, token } = inputs;
  const sourceBranch = resolveStringTemplate(
    config.pullRequest.branchNameTemplate,
    strPatCtx,
  );
  const label = typeof config.pullRequest.label.onCreate === "string"
    ? config.pullRequest.label.onCreate
    : config.pullRequest.label.onCreate.name;

  const foundPr = await provider.findUniquePullRequestForCommitOrThrow(
    token,
    triggerCommitHash,
    sourceBranch,
    label,
  );

  taskLogger.debug(
    `Found associated pull request for trigger commit (${triggerCommitHash}):\n` +
      JSON.stringify(foundPr, null, 2),
  );

  return foundPr;
}

export async function findPullRequestFromBranchOrThrow(
  provider: PlatformProvider,
  strPatCtx: BaseStringPatternContext,
  token: string,
  config: PullRequestBranchAndLabelConfigParams,
): Promise<ProviderPullRequest | undefined> {
  const branchName = resolveStringTemplate(
    config.pullRequest.branchNameTemplate,
    strPatCtx,
  );
  const label = typeof config.pullRequest.label.onCreate === "string"
    ? config.pullRequest.label.onCreate
    : config.pullRequest.label.onCreate.name;

  const foundPr = await provider.findUniquePullRequestFromBranchOrThrow(
    token,
    branchName,
    label,
  );

  taskLogger.debug(
    `Found associated pull request for branch '${branchName}':\n` +
      JSON.stringify(foundPr, null, 2),
  );

  return foundPr;
}
