import { initSync } from "@rainbowatcher/toml-edit-js/index";
import wasmBytes from "./index_bg.wasm" with { type: "bytes" }; // will present on build task

export function initTomlEditJs() {
  initSync({ module: wasmBytes });
}
