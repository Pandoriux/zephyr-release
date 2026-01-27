import { taskLogger } from "./logger.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";
import type { PullRequestConfigOutput } from "../schemas/configs/modules/pull-request-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderBranch } from "../types/providers/branch.ts";

type SetupWorkingBranchInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash"
>;

interface SetupWorkingBranchConfigParams {
  pullRequest: {
    branchNameTemplate: PullRequestConfigOutput["branchNameTemplate"];
  };
}

export async function setupWorkingBranchOrThrow(
  provider: PlatformProvider,
  inputs: SetupWorkingBranchInputsParams,
  config: SetupWorkingBranchConfigParams,
): Promise<ProviderBranch> {
  const { triggerCommitHash } = inputs;
  const branchName = await resolveStringTemplateOrThrow(
    config.pullRequest.branchNameTemplate,
  );

  const workBranch = await provider.ensureBranchAtCommitOrThrow(
    branchName,
    triggerCommitHash,
  );

  taskLogger.debug(
    `Ensured working branch '${branchName}' at commit ${triggerCommitHash}:\n` +
      JSON.stringify(workBranch, null, 2),
  );

  return workBranch;
}
