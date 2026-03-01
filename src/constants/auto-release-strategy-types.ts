export const AutoStrategyTypes = {
  commitTypes: "commit-types",
  commitFooter: "commit-footer",
  flag: "flag",
} as const;

export type AutoStrategyType =
  typeof AutoStrategyTypes[keyof typeof AutoStrategyTypes];
