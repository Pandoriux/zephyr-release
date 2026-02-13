import { CommitParser } from "conventional-commits-parser";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { OperationTriggerContext } from "../types/operation-context.ts";
import { SafeExit } from "../errors/safe-exit.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ProviderConcurrencyResult } from "../types/providers/concurrency.ts";

export async function validateCurrentOperationCtxOrExit(
  provider: PlatformProvider,
  concurrencyResult: ProviderConcurrencyResult,
  allowedCommitTypes: ConfigOutput["commitTypes"],
): Promise<OperationTriggerContext> {
  const operationContext = provider.getOperationTriggerContextOrThrow();

  if (!operationContext.latestTriggerCommit) {
    throw new SafeExit("Latest commit is invalid, this might be a delete push");
  }

  const commitParser = new CommitParser(
    provider.getConventionalCommitParserOptions(),
  );
  const allowedTypes = new Set(allowedCommitTypes.map((c) => c.type));

  const parsedLatestTriggerCommit = commitParser.parse(
    operationContext.latestTriggerCommit.message,
  );
  const parsedTriggerCommits = operationContext.triggerCommits.map((c) =>
    commitParser.parse(c.message)
  );

  const parsedOperationContext = {
    latestTriggerCommit: {
      commit: parsedLatestTriggerCommit,
      treeHash: operationContext.latestTriggerCommit.treeHash,
    },
    triggerCommits: parsedTriggerCommits,
  } satisfies OperationTriggerContext;

  if (
    !((parsedLatestTriggerCommit.type &&
      allowedTypes.has(parsedLatestTriggerCommit.type)) ||
      parsedTriggerCommits.some((c) => c.type && allowedTypes.has(c.type)))
  ) {
    // If our concurrency check found that we interrupted a previous run (or one failed),
    // we assume there is "Unfinished Business" and force a run.
    // This saves us the 2 API calls below.
    if (concurrencyResult.isLatestExecution && concurrencyResult.hasIncompleteHistory) {
      return parsedOperationContext;
    }

    // recheck for missed allowed commits
    const latestTagName = await provider.getLatestReleaseTagOrThrow();
    if (!latestTagName) return parsedOperationContext;

    const compareCommits = await provider.compareCommitsOrThrow(
      latestTagName,
      operationContext.latestTriggerCommit.hash,
    );

    if (compareCommits.totalCommits > 250) {
      return parsedOperationContext;
    }

    const hasValidCommit = compareCommits.commits.some((c) => {
      const parsed = commitParser.parse(c.message);
      return parsed.type && allowedTypes.has(parsed.type);
    });
    if (hasValidCommit) return parsedOperationContext;

    throw new SafeExit("No commits with an allowed type found");
  }

  return parsedOperationContext;
}
