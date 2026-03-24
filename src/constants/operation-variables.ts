export const OperationKinds = {
  propose: "propose",
  release: "release",
  autorelease: "autorelease",
} as const;

export type OperationKind = typeof OperationKinds[keyof typeof OperationKinds];

export const OperationJobs = {
  createProposal: "create-proposal",
  updateProposal: "update-proposal",
  createTag: "create-tag",
  createRelease: "create-release",
  createCommit: "create-commit",
} as const;

export type OperationJob = typeof OperationJobs[keyof typeof OperationJobs];

const OperationOutcomes = {
  success: "success",
  skipped: "skipped",
  failure: "failure",
} as const;

export type OperationOutcome =
  typeof OperationOutcomes[keyof typeof OperationOutcomes];
