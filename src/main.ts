import { markScriptEnd, markScriptStart } from "./lifecycle.ts";
import { run } from "./run.ts";
import { logger } from "./utils/logger.ts";

async function main() {
  markScriptStart();

  try {
    await run();
  } catch (error) {
    logger.setFailed("❌ An unexpected error occurred: " + error);
    if (error instanceof Error && error.stack) {
      logger.startGroup("Stack trace:");
      logger.info(error.stack);
      logger.endGroup();
    }

    markScriptEnd("Failed");
  }

  markScriptEnd("Finished");
}

main();
