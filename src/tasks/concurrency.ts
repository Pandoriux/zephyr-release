import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { SafeExit } from "../errors/safe-exit.ts";
import type { ProviderConcurrencyResult } from "../types/providers/concurrency.ts";

export async function manageConcurrencyOrExit(
  provider: PlatformProvider,
): Promise<ProviderConcurrencyResult> {
  const result = await provider.manageConcurrency();
  if (!result.isLatestExecution) {
    throw new SafeExit(
      `Workflow run '${result.newerExecutionId}' is newer than current run '${result.currentExecutionId}'. This instance is obsolete`,
    );
  }

  return result;
}
