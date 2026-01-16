import { spawn } from "node:child_process";
import process from "node:process";
import { taskLogger } from "./logger.ts";
import {
  isCommandHookValid,
  isCommandValid,
} from "../utils/validations/command.ts";
import type {
  CommandHookKind,
  CommandHookOutput,
} from "../schemas/configs/modules/components/command-hook.ts";

export async function runCommandsOrThrow(
  commandHook: CommandHookOutput | undefined,
  kind: CommandHookKind,
): Promise<string | undefined> {
  if (!isCommandHookValid(commandHook, kind)) return undefined;

  const commands = commandHook[kind];
  const baseTimeout = commandHook.timeout;
  const baseContinueOnError = commandHook.continueOnError;

  const cmdList = Array.isArray(commands) ? commands : [commands];

  let succeedCount = 0;
  let skippedCount = 0;
  const failedCommands: string[] = [];

  taskLogger.startGroup("Commands log:");
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
      const message = error instanceof Error ? error.message : String(error);

      if (continueOnError) {
        taskLogger.info(message);
        failedCommands.push(cmdStr);
      } else {
        taskLogger.endGroup();
        throw new Error(
          `\`${runCommandsOrThrow.name}\` failed!`,
          { cause: error },
        );
      }
    }
  }
  taskLogger.endGroup();

  return `${succeedCount} cmd succeed, ${skippedCount} cmd skipped, ${failedCommands.length} cmd failed${
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

      reject(
        new Error(`Command timed out after ${timeout}ms: ${cmd}`),
      );
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
