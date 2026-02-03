import { taskLogger } from "./logger.ts";
import { initTomlEditJs } from "../libs/@rainbowatcher/toml-edit-js/initWasm.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";

export function setupOperation(
  provider: PlatformProvider,
  inputs: InputsOutput,
) {
  taskLogger.info("Setting up provider context with inputs");
  provider.setupProviderContext(inputs);

  taskLogger.info("Initializing @rainbowatcher/toml-edit-js wasm module...");
  initTomlEditJs();
}
