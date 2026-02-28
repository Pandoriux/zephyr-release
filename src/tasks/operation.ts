import { CommitParser } from "conventional-commits-parser";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { OperationTriggerContext } from "../types/operation-context.ts";
import { SafeExit } from "../errors/safe-exit.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";

export function validateCurrentOperationTriggerCtxOrExit(
  provider: PlatformProvider,
  allowedCommitTypes: ConfigOutput["commitTypes"],
): OperationTriggerContext {
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
      parsedCommit: parsedLatestTriggerCommit,
      treeHash: operationContext.latestTriggerCommit.treeHash,
    },
    parsedTriggerCommits: parsedTriggerCommits,
  } satisfies OperationTriggerContext;

  if (
    !((parsedLatestTriggerCommit.type &&
      allowedTypes.has(parsedLatestTriggerCommit.type)) ||
      parsedTriggerCommits.some((c) => c.type && allowedTypes.has(c.type)))
  ) {
    throw new SafeExit("No commits with an allowed type found");
  }

  return parsedOperationContext;
}
