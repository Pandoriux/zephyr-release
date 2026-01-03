import { VERSION } from "./version.generated.ts";
import { logger } from "./tasks/logger.ts";

export function markProcessStart(startTime: Date) {
  logger.info(
    `🔹 Zephyr Release Started 🍃 • version: ${VERSION} • at: ${startTime.toISOString()}`,
  );
}

export function markProcessEnd(reason: "Finished" | "Failed", startTime: Date) {
  const endTime = new Date();

  logger.info(
    `🔹 Zephyr Release ${reason} 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
      endTime.getTime() - startTime.getTime()
    }ms)`,
  );
}
