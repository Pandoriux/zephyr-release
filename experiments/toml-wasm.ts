import { initTomlEditJs } from "../src/libs/@rainbowatcher/toml-edit-js/initWasm.ts";
import { parse as parseToml } from "@rainbowatcher/toml-edit-js/index";

initTomlEditJs();

const toml = Deno.readTextFileSync("experiments/t.toml");

console.log(parseToml(toml));
