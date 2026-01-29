import type { PlatformProvider } from "../types/providers/platform-provider.ts";

export async function manageConcurrency(
  provider: PlatformProvider,
): Promise<void> {
  await provider.manageConcurrency();
}
