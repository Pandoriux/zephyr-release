import { logger } from "../utils/logger.ts";
import { initTomlEditJs } from "../libs/toml-edit-js/initWasm.ts";

export function prepareEnvironment() {
  logger.debug("Initializing @rainbowatcher/toml-edit-js wasm module...");
  initTomlEditJs();
}
