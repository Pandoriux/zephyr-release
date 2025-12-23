import * as core from "@actions/core";

export const logger = Object.freeze({
  info,
  setFailed,
  startGroup,
  endGroup,
  debug,
  debugWrap,
});

function info(...args: Parameters<typeof core.info>) {
  core.info(...args);
}

function setFailed(...args: Parameters<typeof core.setFailed>) {
  core.setFailed(...args);
}

function startGroup(...args: Parameters<typeof core.startGroup>) {
  core.startGroup(...args);
}

function endGroup(...args: Parameters<typeof core.endGroup>) {
  core.endGroup(...args);
}

function debug(...args: Parameters<typeof core.debug>) {
  core.debug(...args);
}

function debugWrap(fn: () => void) {
  if (core.isDebug()) fn();
}
