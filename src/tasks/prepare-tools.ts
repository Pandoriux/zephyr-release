import { logger } from "./logger.ts";
import { initTomlEditJs } from "../libs/toml-edit-js/initWasm.ts";

export function prepareTools() {
  logger.debug("Initializing @rainbowatcher/toml-edit-js wasm module...");
  initTomlEditJs();
}
