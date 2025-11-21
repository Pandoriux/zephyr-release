import * as core from "@actions/core";
import { markScriptEnd, markScriptStart } from "./lifecycle.ts";
import { run } from "./run.ts";

async function main() {
  markScriptStart();

  try {
    await run();
  } catch (error) {
    core.setFailed("❌ An unexpected error occurred: " + error);
    if (error instanceof Error && error.stack) {
      core.startGroup("Stack trace:");
      core.info(error.stack);
      core.endGroup();
    }

    markScriptEnd("Failed");
  }

  markScriptEnd("Finished");
}

main();
