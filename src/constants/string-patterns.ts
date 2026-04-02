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

  // Configuration
  timeZone: "timeZone",
} as const;

export type FixedBaseStringPattern =
  typeof FixedBaseStringPatterns[keyof typeof FixedBaseStringPatterns];

export const FixedDatetimeStringPatterns = {
  timestamp: "timestamp",
  year: "YYYY",
  month: "MM",
  day: "DD",
  hour: "HH",
  minute: "mm",
  second: "ss",
} as const;

export type FixedDatetimeStringPattern =
  typeof FixedDatetimeStringPatterns[keyof typeof FixedDatetimeStringPatterns];

export const DynamicDatetimeStringPatterns = {
  nowTimestamp: "nowTimestamp",
  nowYear: "nowYYYY",
  nowMonth: "nowMM",
  nowDay: "nowDD",
  nowHour: "nowHH",
  nowMinute: "nowmm",
  nowSecond: "nowss",
} as const;

export type DynamicDatetimeStringPattern =
  typeof DynamicDatetimeStringPatterns[
    keyof typeof DynamicDatetimeStringPatterns
  ];

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
  commit: "commit",
  hash: "hash",
  type: "type",
  scope: "scope",
  desc: "desc",
  body: "body",
  footer: "footer",
  breakingDesc: "breakingDesc",
  isBreaking: "isBreaking",
} as const;

export type ChangelogReleaseEntryPattern = typeof ChangelogReleaseEntryPatterns[
  keyof typeof ChangelogReleaseEntryPatterns
];
