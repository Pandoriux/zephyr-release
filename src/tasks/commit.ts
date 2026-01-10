import { taskLogger } from "./logger.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { ProviderCommit } from "../types/providers/commit.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";

type CollectCommitsInputsParams = Pick<
  InputsOutput,
  "currentCommitHash" | "token"
>;

export async function collectCommitsFromCurrentToLastRelease(
  provider: PlatformProvider,
  inputs: CollectCommitsInputsParams,
): Promise<ProviderCommit[]> {
  const commitResults = await provider
    .findCommitsFromGivenToPreviousTaggedOrThrow(
      inputs.token,
      inputs.currentCommitHash,
    );

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup("Collected Commits:");
    dLogger.info(JSON.stringify(commitResults, null, 2));
    dLogger.endGroup();
  });

  return commitResults;
}
