import * as core from "@actions/core";
import type { CoreLogger } from "../../types/logger.ts";

export const githubLogger: CoreLogger = Object.freeze({
  info: (message: string) => core.info(message),

  startGroup: (name: string) => core.startGroup(name),
  endGroup: () => core.endGroup(),

  debug: (message: string) => core.debug(message),
  isDebugEnabled: () => core.isDebug(),

  notice: (message: string) => core.notice(message),

  warn: (message: string) => core.warning(message),

  setFailed: (message: string | Error) => core.setFailed(message),
});
