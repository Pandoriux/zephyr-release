import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ProviderCommit } from "../types/providers/commit.ts";

type CalculateNextVersionConfigParams = Pick<
  ConfigOutput,
  "initialVersion" | "versionFiles" | "commitTypes" | "bumpStrategy"
>;

export async function calculateNextVersion(
  commits: ProviderCommit[],
  config: CalculateNextVersionConfigParams,
): Promise<string> {
  // Placeholder implementation
  return "0.0.1";
}
