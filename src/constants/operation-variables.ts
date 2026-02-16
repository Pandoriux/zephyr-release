export const OperationKinds = {
  propose: "propose",
  release: "release",
} as const;

export type OperationKind = typeof OperationKinds[keyof typeof OperationKinds];

export const OperationJobs = {
  createPr: "create-pr",
  updatePr: "update-pr",
  createTag: "create-tag",
  createReleaseNote: "create-release-note",
} as const;

export type OperationJob = typeof OperationJobs[keyof typeof OperationJobs];
