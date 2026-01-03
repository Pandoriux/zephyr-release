import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { BaseOpVariables } from "../types/operation-variables.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";

type GetBaseOpVariablesInputs = Pick<
  InputsOutput,
  "currentCommitHash" | "token"
>;

export async function getBaseOpVariables(
  provider: PlatformProvider,
  { currentCommitHash, token }: GetBaseOpVariablesInputs,
): BaseOpVariables {
  const opTarget = await provider.getPullRequestsForCommit(
    currentCommitHash,
    token,
  );
}
