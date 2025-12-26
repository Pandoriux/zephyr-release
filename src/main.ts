import { markProcessEnd, markProcessStart } from "./lifecycle.ts";
import { run } from "./run.ts";
import { logger } from "./utils/logger.ts";

async function main() {
  markProcessStart();

  try {
    await run();
  } catch (error) {
    logger.setFailed("❌ An unexpected error occurred: " + error);
    if (error instanceof Error && error.stack) {
      logger.startGroup("Stack trace:");
      logger.info(error.stack);
      logger.endGroup();
    }

    markProcessEnd("Failed");
  }

  markProcessEnd("Finished");
}

main();
