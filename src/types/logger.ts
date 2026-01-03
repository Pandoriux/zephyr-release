export interface CoreLogger {
  info: (message: string) => void;

  startGroup: (name: string) => void;
  endGroup: () => void;

  debug: (message: string) => void;
  isDebugEnabled?: () => boolean;

  setFailed: (message: string | Error) => void;
}

export interface Logger {
  info: (message: string) => void;

  step: (message: string) => void;
  stepStart: (message: string) => void;
  stepFinish: (message: string) => void;
  stepSkip: (message: string) => void;

  startGroup: (name: string) => void;
  endGroup: () => void;

  debug: (message: string) => void;
  debugStepStart: (message: string) => void;
  debugStepFinish: (message: string) => void;
  debugStepSkip: (message: string) => void;
  debugWrap: (fn: (debugLogger: DebugLogger) => void) => void;

  setFailed: (message: string | Error) => void;

  /**
   * A sub-logger that prefixes each line with `"  │ "` (supports multiline).
   *
   * Note: does NOT include `step()` or `setFailed()`.
   */
  indent: IndentLogger;
}

export type DebugLogger = Pick<Logger, "info" | "startGroup" | "endGroup">;

export type IndentLogger = Pick<
  Logger,
  "info" | "startGroup" | "endGroup" | "debug" | "debugWrap"
>;
