import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";

type ManageConcurrencyInputsParams = Pick<InputsOutput, "token">;

export async function manageConcurrency(
  provider: PlatformProvider,
  inputs: ManageConcurrencyInputsParams,
): Promise<void> {
  await provider.manageConcurrency(inputs.token);
}
