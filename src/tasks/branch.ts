import { taskLogger } from "./logger.ts";
import { resolveStringTemplate } from "./string-patterns/resolve-string-template.ts";
import type { PullRequestConfigOutput } from "../schemas/configs/modules/pull-request-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderBranch } from "../types/providers/branch.ts";
import type { BaseStringPatternContext } from "../types/string-patterns.ts";

type SetupWorkingBranchInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "token"
>;

interface SetupWorkingBranchConfigParams {
  pullRequest: {
    branchNameTemplate: PullRequestConfigOutput["branchNameTemplate"];
  };
}

export async function setupWorkingBranchOrThrow(
  provider: PlatformProvider,
  strPatCtx: BaseStringPatternContext,
  inputs: SetupWorkingBranchInputsParams,
  config: SetupWorkingBranchConfigParams,
): Promise<ProviderBranch> {
  const { triggerCommitHash, token } = inputs;
  const branchName = resolveStringTemplate(
    config.pullRequest.branchNameTemplate,
    strPatCtx,
  );

  const workBranch = await provider.ensureBranchAtCommitOrThrow(
    token,
    branchName,
    triggerCommitHash,
  );

  taskLogger.debug(
    `Ensured working branch '${branchName}' at commit ${triggerCommitHash}:\n` +
      JSON.stringify(workBranch, null, 2),
  );

  return workBranch;
}
