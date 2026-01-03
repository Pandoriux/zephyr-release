export const OperationTargets = {
  prepare: "prepare",
  release: "release",
} as const;

export type OperationTarget =
  typeof OperationTargets[keyof typeof OperationTargets];

export const OperationJobs = {
  createBranch: "create-branch",
  createPr: "create-pr",
  updatePr: "update-pr",
} as const;

export type OperationJob = typeof OperationJobs[keyof typeof OperationJobs];
