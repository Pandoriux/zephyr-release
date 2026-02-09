import type { PlatformProvider } from "../types/providers/platform-provider.ts";

export async function manageConcurrencyOrExit(
  provider: PlatformProvider,
): Promise<void> {
  await provider.manageConcurrency();
}
