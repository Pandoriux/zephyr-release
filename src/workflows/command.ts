import { spawn } from "node:child_process";
import process from "node:process";
import type { CommandOutput } from "../schemas/configs/modules/components/command.ts";
import { logger } from "../utils/logger.ts";
import { exitFailure } from "../lifecycle.ts";

export function isCommandHookValid(
  commands: CommandOutput | CommandOutput[],
): boolean {
  // Single command (not array)
  if (!Array.isArray(commands)) {
    return isCommandValid(commands);
  }

  // Array: must have at least one valid command
  if (commands.length === 0) return false;

  // For arrays with multiple elements, find at least one valid command
  return commands.some((cmd) => isCommandValid(cmd));
}

function isCommandValid(command: CommandOutput): boolean {
  if (typeof command === "string") {
    return Boolean(command);
  }
  return Boolean(command.cmd);
}

export async function runCommands(
  commands: CommandOutput | CommandOutput[],
  baseTimeout: number,
  baseContinueOnError: boolean,
  commandTitle?: string,
): Promise<string> {
  const cmdList = Array.isArray(commands) ? commands : [commands];

  let succeedCount = 0;
  let skippedCount = 0;
  const failedCommands: string[] = [];

  logger.startGroup(
    (commandTitle ? `${commandTitle} commands ` : "Commands ") + "logs",
  );
  for (const cmd of cmdList) {
    // Check if command is empty/invalid (skipped)
    if (!isCommandValid(cmd)) {
      skippedCount++;
      continue;
    }

    const cmdStr = typeof cmd === "string" ? cmd : cmd.cmd;
    const timeout = typeof cmd === "string"
      ? baseTimeout
      : (cmd.timeout ?? baseTimeout);
    const continueOnError = typeof cmd === "string"
      ? baseContinueOnError
      : (cmd.continueOnError ?? baseContinueOnError);

    try {
      await runChildProcessOrThrow(cmdStr, timeout);
      succeedCount++;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);

      logger.info(errorMessage);
      failedCommands.push(cmdStr);

      if (!continueOnError) {
        logger.endGroup();
        exitFailure(
          `Command failed: ${cmdStr}. ${errorMessage}`,
        );
      }
    }
  }
  logger.endGroup();

  return `${succeedCount} cmd succeed, ${skippedCount} cmd skipped, ${
    failedCommands.length
  } cmd failed${
    failedCommands.length > 0 ? ` (${failedCommands.join(", ")})` : ""
  }`;
}

async function runChildProcessOrThrow(
  cmd: string,
  timeout: number,
) {
  await new Promise<void>((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const shell = isWindows ? "cmd.exe" : "/bin/sh";
    const shellArgs = isWindows ? ["/d", "/s", "/c"] : ["-c"];

    const child = spawn(shell, [...shellArgs, cmd], {
      stdio: "inherit",
      shell: false,
    });

    const timeoutId = setTimeout(() => {
      child.kill("SIGTERM");

      // Force kill after a short grace period
      setTimeout(() => {
        if (!child.killed) {
          child.kill("SIGKILL");
        }
      }, 1000);

      reject(new Error(`Command timed out after ${timeout}ms: ${cmd}`));
    }, timeout);

    child.on("error", (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    child.on("exit", (code, signal) => {
      clearTimeout(timeoutId);
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Command failed with code ${code ?? "unknown"}${
              signal ? ` (signal: ${signal})` : ""
            }: ${cmd}`,
          ),
        );
      }
    });
  });
}
