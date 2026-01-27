import { taskLogger } from "./logger.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";
import type { CoreLabelOutput } from "../schemas/configs/modules/components/core-label.ts";
import type { PullRequestConfigOutput } from "../schemas/configs/modules/pull-request-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";

type FindPrForCommitInputsParams = Pick<InputsOutput, "triggerCommitHash">;

interface PullRequestBranchAndLabelConfigParams {
  pullRequest: {
    branchNameTemplate: PullRequestConfigOutput["branchNameTemplate"];
    label: { onCreate: CoreLabelOutput["onCreate"] };
  };
}

export async function findPullRequestForCommitOrThrow(
  provider: PlatformProvider,
  inputs: FindPrForCommitInputsParams,
  config: PullRequestBranchAndLabelConfigParams,
): Promise<ProviderPullRequest | undefined> {
  const { triggerCommitHash } = inputs;
  const sourceBranch = await resolveStringTemplateOrThrow(
    config.pullRequest.branchNameTemplate,
  );
  const label = typeof config.pullRequest.label.onCreate === "string"
    ? config.pullRequest.label.onCreate
    : config.pullRequest.label.onCreate.name;

  const foundPr = await provider.findUniquePullRequestForCommitOrThrow(
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
  config: PullRequestBranchAndLabelConfigParams,
): Promise<ProviderPullRequest | undefined> {
  const branchName = await resolveStringTemplateOrThrow(
    config.pullRequest.branchNameTemplate,
  );
  const label = typeof config.pullRequest.label.onCreate === "string"
    ? config.pullRequest.label.onCreate
    : config.pullRequest.label.onCreate.name;

  const foundPr = await provider.findUniquePullRequestFromBranchOrThrow(
    branchName,
    label,
  );

  taskLogger.debug(
    `Found associated pull request for branch '${branchName}':\n` +
      JSON.stringify(foundPr, null, 2),
  );

  return foundPr;
}
