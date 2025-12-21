import * as core from "@actions/core";
import { initTomlEditJs } from "../libs/toml-edit-js-wrapper/initWasm.ts";

export function prepareEnvironment() {
  core.info("Initializing @rainbowatcher/toml-edit-js wasm module...");
  initTomlEditJs();
}
