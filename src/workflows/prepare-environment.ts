import { logger } from "../utils/logger.ts";
import { initTomlEditJs } from "../libs/toml-edit-js-wrapper/initWasm.ts";

export function prepareEnvironment() {
  logger.info("Initializing @rainbowatcher/toml-edit-js wasm module...");
  initTomlEditJs();
}
