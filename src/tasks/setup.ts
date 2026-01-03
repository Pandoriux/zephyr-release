import { taskLogger } from "./logger.ts";
import { initTomlEditJs } from "../libs/toml-edit-js/initWasm.ts";

export function setupOperation() {
  taskLogger.debug("Initializing @rainbowatcher/toml-edit-js wasm module...");
  initTomlEditJs();
}
