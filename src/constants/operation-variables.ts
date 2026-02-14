export const OperationTargets = {
  propose: "propose",
  release: "release",
} as const;

export type OperationTarget =
  typeof OperationTargets[keyof typeof OperationTargets];

export const OperationJobs = {
  createPr: "create-pr",
  updatePr: "update-pr",
  createTag: "create-tag",
  createReleaseNote: "create-release-note",
} as const;

export type OperationJob = typeof OperationJobs[keyof typeof OperationJobs];
