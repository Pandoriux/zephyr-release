import { CommitParser } from "conventional-commits-parser";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { OperationContext } from "../types/operation-context.ts";
import { SafeExit } from "../errors/safe-exit.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";

export function validateCurrentOperationCtxOrExit(
  provider: PlatformProvider,
  allowedCommitTypes: ConfigOutput["commitTypes"],
): OperationContext {
  const operationContext = provider.getOperationContextOrThrow();

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
  } satisfies OperationContext;

  if (
    !(
      (parsedLatestTriggerCommit.type &&
        allowedTypes.has(parsedLatestTriggerCommit.type)) ||
      parsedTriggerCommits.some((c) => c.type && allowedTypes.has(c.type))
    )
  ) {
    throw new SafeExit("No commits with an allowed type found");
  }

  return parsedOperationContext;
}
