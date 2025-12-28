export interface Logger {
  info: (message: string) => void;

  startGroup: (name: string) => void;
  endGroup: () => void;

  debug: (message: string) => void;
  debugWrap: (fn: () => void) => void;

  setFailed: (message: string | Error) => void;
}
