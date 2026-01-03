import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";

type GetBaseOpVariablesInputs = Pick<
  InputsOutput,
  "currentCommitHash" | "token"
>;

export async function getCurrentPullReuqest(
  provider: PlatformProvider,
  { currentCommitHash, token }: GetBaseOpVariablesInputs,
) {
  const foundPrs = await provider.getPullRequestsForCommit(
    currentCommitHash,
    token,
  );
}
