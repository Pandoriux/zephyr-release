import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ResolvedCommitsResult } from "./commit.ts";

type CalculateNextVersionConfigParams = Pick<ConfigOutput, "bumpStrategy">;

export async function calculateNextVersion(
  resolvedCommitsResult: ResolvedCommitsResult,
  config: CalculateNextVersionConfigParams,
): Promise<string> {
  const { parsedCurrentCommit, commits } = resolvedCommitsResult;

  if (parsedCurrentCommit) {
    parsedCurrentCommit.footer;
  }

  let majorCount = 0;
  let minorCount = 0;
  let patchCount = 0;

  for (const commit of commits) {
  }
  // Placeholder implementation
  return "0.0.1";
}
