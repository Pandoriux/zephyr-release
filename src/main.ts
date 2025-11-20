import process from "node:process";
import * as core from "@actions/core";
import { VERSION } from "./action-version.ts"; // run build once to generate this file
import { run } from "./run.ts";

let startTime: Date;
let endTime: Date;

export function manualExit(failMessage: string) {
  endTime = new Date();

  core.setFailed(`❌ ${failMessage}`);
  core.info(
    `🔹 Stopped Zephyr Release 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
      endTime.getTime() - startTime.getTime()
    }ms)`,
  );

  process.exit();
}

async function main() {
  startTime = new Date();
  core.info(
    `🔹 Starting Zephyr Release 🍃 • version: ${VERSION} • at: ${startTime.toISOString()}`,
  );

  try {
    await run();
  } catch (error) {
    endTime = new Date();

    core.setFailed("❌ An unexpected error occurred:");
    if (error instanceof Error && error.stack) {
      core.startGroup("Error stack:");
      core.info(error.stack);
      core.endGroup();
    } else {
      core.info(String(error));
    }

    core.info(
      `🔹 Stopped Zephyr Release 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
        endTime.getTime() - startTime.getTime()
      }ms)`,
    );

    process.exit();
  }

  endTime = new Date();
  core.info(
    `🔹 Finished Zephyr Release 🍃 • version: ${VERSION} • at: ${endTime.toISOString()} (took ${
      endTime.getTime() - startTime.getTime()
    }ms)`,
  );
}

main();
