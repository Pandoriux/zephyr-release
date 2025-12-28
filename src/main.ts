import { markProcessEnd, markProcessStart } from "./lifecycle.ts";
import { run } from "./run.ts";
import { getProviderOrThrow } from "./providers/provider.ts";
import { logger, setLogger } from "./tasks/logger.ts";

async function main() {
  try {
    const provider = await getProviderOrThrow();
    setLogger(provider.logger);

    markProcessStart();

    await run(provider);

    markProcessEnd("Finished");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    logger.setFailed("❌ Operation Failed! - An error occurred: " + message);
    if (error instanceof Error && error.stack) {
      logger.startGroup("Stack trace:");
      logger.info(error.stack);
      logger.endGroup();
    }

    markProcessEnd("Failed");
  }
}

main();
