import process from "node:process";
import core from "@actions/core";
import { VERSION } from "./action-version.ts"; // run build once to generate this file
import { run } from "./run.ts";

async function main() {
  core.info(`🔹 Start zephyr-release - version: ${VERSION} 🍃`);

  try {
    await run();
  } catch (error) {
    core.setFailed("❌ An unexpected error occurred:\n" + error);
    process.exit();
  }

  core.info(`🔹 Finished zephyr-release - version: ${VERSION} ✔`);
}

main();
