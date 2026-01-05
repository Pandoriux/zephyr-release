import type { CoreLabelOutput } from "../schemas/configs/modules/components/core-label.ts";
import type { PullRequestConfigOutput } from "../schemas/configs/modules/pull-request-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { BaseStringPatternContext } from "../types/string-patterns.ts";
import { resolveStringTemplate } from "./string-patterns/resolve-string-template.ts";

type GetPullReuqestInputsParams = Pick<
  InputsOutput,
  "currentCommitHash" | "token"
>;

interface GetPullReuqestConfigParams {
  sourceBranchTemplate: PullRequestConfigOutput["branchNameTemplate"];
  onCreateCoreLabel: CoreLabelOutput["onCreate"];
}

export async function getCurrentAssociatedPullReuqest(
  provider: PlatformProvider,
  strPatCtx: BaseStringPatternContext,
  inputs: GetPullReuqestInputsParams,
  config: GetPullReuqestConfigParams,
) {
  const { currentCommitHash, token } = inputs;
  const sourceBranch = resolveStringTemplate(
    config.sourceBranchTemplate,
    strPatCtx,
  );
  const label = typeof config.onCreateCoreLabel === "string"
    ? config.onCreateCoreLabel
    : config.onCreateCoreLabel.name;

  const foundPrs = await provider.getPullRequestsForCommitOrThrow(
    token,
    currentCommitHash,
    sourceBranch,
    label,
  );
}
