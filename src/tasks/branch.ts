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

export type WorkingBranchResult = ProviderBranch & { name: string };

export async function setupWorkingBranchOrThrow(
  provider: PlatformProvider,
  inputs: SetupWorkingBranchInputsParams,
  config: SetupWorkingBranchConfigParams,
): Promise<WorkingBranchResult> {
  const { triggerCommitHash } = inputs;
  const branchName = await resolveStringTemplateOrThrow(
    config.pullRequest.branchNameTemplate,
  );

  const workingBranch = await provider.ensureBranchExistOrThrow(
    branchName,
    triggerCommitHash,
  );

  taskLogger.debug(
    `Ensured working branch '${branchName}' at commit ${triggerCommitHash}:\n` +
      JSON.stringify(workingBranch, null, 2),
  );

  return {
    ...workingBranch,
    name: workingBranch.ref.replace("refs/heads/", ""),
  };
}
