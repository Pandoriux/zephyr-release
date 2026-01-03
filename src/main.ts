import "@js-joda/timezone";
import { markProcessEnd, markProcessStart } from "./lifecycle.ts";
import { run } from "./run.ts";
import { getProviderOrThrow } from "./providers/provider.ts";
import { logger, setLogger } from "./tasks/logger.ts";
import { formatErrorHierarchy } from "./utils/formatters/error.ts";

async function main() {
  const startTime = new Date();

  try {
    const provider = await getProviderOrThrow();
    setLogger(provider.logger);

    markProcessStart(startTime);

    await run(provider, startTime);

    markProcessEnd("Finished", startTime);
  } catch (error) {
    logger.setFailed(
      "❌ Operation Failed! • An error occurred:\n" +
        formatErrorHierarchy(error),
    );

    if (error instanceof Error && error.stack) {
      logger.startGroup("Stack trace:");
      logger.info(error.stack);
      logger.endGroup();
    }

    markProcessEnd("Failed", startTime);
  }
}

main();
