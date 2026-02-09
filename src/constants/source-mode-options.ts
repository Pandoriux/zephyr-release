export const SourceModeOptions = {
  remote: "remote",
  local: "local",
} as const;

export type SourceModeOption =
  typeof SourceModeOptions[keyof typeof SourceModeOptions];
