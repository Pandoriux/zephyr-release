import process from "node:process";
import * as core from "@actions/core";
import { VERSION } from "./script-version.ts";

const startTime = new Date();

export function markScriptStart() {
  core.info(
    `🔹 Starting Zephyr Release 🍃 • version: ${VERSION} • at: ${startTime.toISOString()}`,
  );
}

export function markScriptEnd(reason: "Finished" | "Failed"): never {
  const endTime = new Date();

  core.info(
    `🔹 ${reason} Zephyr Release 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
      endTime.getTime() - startTime.getTime()
    }ms)`,
  );

  process.exit();
}

export function exitFailure(message: string): never {
  const endTime = new Date();

  core.setFailed(`❌ ${message}`);
  core.info(
    `🔹 Stopped Zephyr Release 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
      endTime.getTime() - startTime.getTime()
    }ms)`,
  );

  process.exit();
}
