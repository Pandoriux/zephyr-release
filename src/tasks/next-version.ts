import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ResolvedCommitsResult } from "./commit.ts";

type CalculateNextVersionConfigParams = Pick<ConfigOutput, "bumpStrategy">;

export async function calculateNextVersion(
  resolvedCommitsResult: ResolvedCommitsResult,
  config: CalculateNextVersionConfigParams,
): Promise<string> {
  const { resolvedTriggerCommit, entries } = resolvedCommitsResult;

  if (resolvedTriggerCommit) {
    resolvedTriggerCommit.footer;
  }

  let majorCount = 0;
  let minorCount = 0;
  let patchCount = 0;

  for (const entry of entries) {
  }
  // Placeholder implementation
  return "0.0.1";
}

function findReleaseAsVersionFooter(footer: string): string | undefined {
}
