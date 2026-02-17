export const FixedBaseStringPatterns = {
  // Project info
  name: "name",
  host: "host",
  namespace: "namespace",
  repository: "repository",
  commitPathPart: "commitPathPart",
  referencePathPart: "referencePathPart",

  triggerBranchName: "triggerBranchName",
  workingBranchName: "workingBranchName",

  // Date Time components
  timeZone: "timeZone",
  timestamp: "timestamp",
  year: "YYYY",
  month: "MM",
  day: "DD",
  hour: "HH",
  minute: "mm",
  second: "ss",
} as const;

export type FixedBaseStringPattern =
  typeof FixedBaseStringPatterns[keyof typeof FixedBaseStringPatterns];

const FixedPreviousVersionStringPatterns = {
  // Previous version components
  previousVersion: "previousVersion",
  previousVersionCore: "previousVersionCore",
  previousVersionPrerelease: "previousVersionPre",
  previousVersionBuild: "previousVersionBld",
};

export type FixedPreviousVersionStringPattern =
  typeof FixedPreviousVersionStringPatterns[
    keyof typeof FixedPreviousVersionStringPatterns
  ];

const FixedVersionStringPatterns = {
  // Version components
  version: "version",
  versionCore: "versionCore",
  versionPrerelease: "versionPre",
  versionBuild: "versionBld",

  // Tag
  tagName: "tagName",
} as const;

export type FixedVersionStringPattern = typeof FixedVersionStringPatterns[
  keyof typeof FixedVersionStringPatterns
];

const DynamicChangelogStringPatterns = {
  changelogRelease: "changelogRelease",
  changelogReleaseBody: "changelogReleaseBody",
} as const;

export type DynamicChangelogStringPattern =
  typeof DynamicChangelogStringPatterns[
    keyof typeof DynamicChangelogStringPatterns
  ];

const ChangelogReleaseEntryPatterns = {
  hash: "hash",
  type: "type",
  scope: "scope",
  desc: "desc",
  body: "body",
  footer: "footer",
  isBreaking: "isBreaking",
} as const;

export type ChangelogReleaseEntryPattern = typeof ChangelogReleaseEntryPatterns[
  keyof typeof ChangelogReleaseEntryPatterns
];
