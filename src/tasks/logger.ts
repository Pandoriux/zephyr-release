import process from "node:process";
import type { Logger } from "../types/logger.ts";

const defaultLogger = {
  info: (message: string) => console.log(message),

  startGroup: (name: string) => console.group(name),
  endGroup: () => console.groupEnd(),

  debug: (message: string) => console.debug(message),
  debugWrap: (fn: () => void) => {
    if (process.env.DEBUG?.toLowerCase() === "true") fn();
  },

  setFailed: (message: string | Error) => {
    const msg = message instanceof Error ? message.message : message;
    console.log(msg);
    process.exitCode = 1;
  },
};

let activeLogger: Logger = defaultLogger;

export const logger: Logger = {
  info: (message: string) => activeLogger.info(message),

  startGroup: (name: string) => activeLogger.startGroup(name),
  endGroup: () => activeLogger.endGroup(),

  debug: (message: string) => activeLogger.debug(message),
  debugWrap: (fn: () => void) => activeLogger.debugWrap(fn),

  setFailed: (message: string | Error) => activeLogger.setFailed(message),
};

export function setLogger(providedLogger: Logger) {
  activeLogger = providedLogger;
}
