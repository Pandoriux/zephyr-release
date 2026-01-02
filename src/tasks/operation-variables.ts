import type { BaseOpVariables } from "../types/operation-variables.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";

// still developing - WIP
export function getBaseOpVariables(
  provider: PlatformProvider,
  currentCommitHash: string,
): BaseOpVariables {
  const opTarget = provider;
}
