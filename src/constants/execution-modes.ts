export const ExecutionModes = {
  review: "review",
  auto: "auto",
} as const;

export type ExecutionMode = typeof ExecutionModes[keyof typeof ExecutionModes];
