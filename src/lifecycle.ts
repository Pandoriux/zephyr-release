import process from "node:process";
import { VERSION } from "./script-version.ts";
import { logger } from "./utils/logger.ts";

const startTime = new Date();

export function markProcessStart() {
  logger.info(
    `🔹 Starting Zephyr Release 🍃 • version: ${VERSION} • at: ${startTime.toISOString()}`,
  );
}

export function markProcessEnd(reason: "Finished" | "Failed"): never {
  const endTime = new Date();

  logger.info(
    `🔹 ${reason} Zephyr Release 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
      endTime.getTime() - startTime.getTime()
    }ms)`,
  );

  process.exit();
}

export function exitFailure(message: string): never {
  const endTime = new Date();

  logger.setFailed("❌ Process Failed.\n" + message);
  logger.info(
    `🔹 Stopped Zephyr Release 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
      endTime.getTime() - startTime.getTime()
    }ms)`,
  );

  process.exit();
}
