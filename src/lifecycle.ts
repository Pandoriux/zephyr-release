import { VERSION } from "./version.generated.ts";
import { logger } from "./tasks/logger.ts";

const startTime = new Date();

export function markProcessStart() {
  logger.info(
    `🔹 Zephyr Release Started 🍃 • version: ${VERSION} • at: ${startTime.toISOString()}`,
  );
}

export function markProcessEnd(reason: "Finished" | "Failed") {
  const endTime = new Date();

  logger.info(
    `🔹 Zephyr Release ${reason} 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
      endTime.getTime() - startTime.getTime()
    }ms)`,
  );
}
