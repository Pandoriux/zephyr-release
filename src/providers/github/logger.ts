import * as core from "@actions/core";
import type { Logger } from "../../types/logger.ts";

export const githubLogger: Logger = Object.freeze({
  info: (message: string) => core.info(message),

  startGroup: (name: string) => core.startGroup(name),
  endGroup: () => core.endGroup(),

  debug: (message: string) => core.debug(message),
  debugWrap: (fn: () => void) => {
    if (core.isDebug()) fn();
  },

  setFailed: (message: string | Error) => core.setFailed(message),
});
