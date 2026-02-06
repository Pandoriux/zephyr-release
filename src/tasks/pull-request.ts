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
    label: { onCreate: CoreLabelOutput["onCreate"] };
  };
}

export async function findPullRequestForCommitOrThrow(
  provider: PlatformProvider,
  workingBranchName: string,
  inputs: FindPrForCommitInputsParams,
  config: PullRequestBranchAndLabelConfigParams,
): Promise<ProviderPullRequest | undefined> {
  const { triggerCommitHash } = inputs;

  const label = typeof config.pullRequest.label.onCreate === "string"
    ? config.pullRequest.label.onCreate
    : config.pullRequest.label.onCreate.name;

  const foundPr = await provider.findUniquePullRequestForCommitOrThrow(
    triggerCommitHash,
    workingBranchName,
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
  workingBranchName: string,
  config: PullRequestBranchAndLabelConfigParams,
): Promise<ProviderPullRequest | undefined> {
  const label = typeof config.pullRequest.label.onCreate === "string"
    ? config.pullRequest.label.onCreate
    : config.pullRequest.label.onCreate.name;

  const foundPr = await provider.findUniquePullRequestFromBranchOrThrow(
    workingBranchName,
    label,
  );

  taskLogger.debug(
    `Found associated pull request for branch '${workingBranchName}':\n` +
      JSON.stringify(foundPr, null, 2),
  );

  return foundPr;
}
