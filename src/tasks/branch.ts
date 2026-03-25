import { taskLogger } from "./logger.ts";
import { resolveStringTemplate } from "./string-templates-and-patterns/resolve-template.ts";
import type { ReviewConfigOutput } from "../schemas/configs/modules/review-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderBranch } from "../types/providers/branch.ts";

type SetupWorkingBranchInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash"
>;

interface SetupWorkingBranchConfigParams {
  review: Pick<ReviewConfigOutput, "workingBranchNameTemplate">;
}

export type WorkingBranchResult = ProviderBranch & { name: string };

/** @throws */
export async function setupWorkingBranch(
  provider: PlatformProvider,
  inputs: SetupWorkingBranchInputsParams,
  config: SetupWorkingBranchConfigParams,
): Promise<WorkingBranchResult> {
  const { triggerCommitHash } = inputs;
  const branchName = await resolveStringTemplate(
    config.review.workingBranchNameTemplate,
  );

  const workingBranch = await provider.ensureBranchExist(
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
