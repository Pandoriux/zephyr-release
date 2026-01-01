import { taskLogger } from "./logger.ts";
import { initTomlEditJs } from "../libs/toml-edit-js/initWasm.ts";

export function prepareTools() {
  taskLogger.debug("Initializing @rainbowatcher/toml-edit-js wasm module...");
  initTomlEditJs();
}
