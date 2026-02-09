import "@js-joda/timezone";
import { markProcessEnd, markProcessStart } from "./lifecycle.ts";
import { run } from "./run.ts";
import { getProviderOrThrow } from "./providers/provider.ts";
import { logger, setLogger } from "./tasks/logger.ts";
import { formatErrorHierarchy } from "./utils/formatters/error.ts";
import { SafeExit } from "./errors/safe-exit.ts";

export const startTime = new Date();

async function main() {
  try {
    const provider = await getProviderOrThrow();
    setLogger(provider.logger);

    markProcessStart();

    await run(provider);

    markProcessEnd("Finished");
  } catch (error) {
    if (error instanceof SafeExit) {
      logger.info(`ℹ️  ${error.message}`);

      markProcessEnd("Exit");
    } else {
      logger.setFailed(
        "❌ Operation Failed! • An error occurred:\n" +
          formatErrorHierarchy(error),
      );

      if (error instanceof Error && error.stack) {
        logger.startGroup("Stack trace:");
        logger.info(error.stack);
        logger.endGroup();
      }

      markProcessEnd("Failed");
    }
  }
}

main();
