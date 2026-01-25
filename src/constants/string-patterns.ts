export const FixedBaseStringPatterns = {
  // Project info
  name: "name", // ${name}
  timeZone: "timeZone", // ${timeZone}
  host: "host", // ${host}
  namespace: "namespace", // ${namespace}
  repository: "repository", // ${repository}
  commitPathPart: "commitPathPart",
  referencePathPart: "referencePathPart",

  // Date components (ISO format)
  year: "YYYY", // ${YYYY}
  month: "MM", // ${MM}
  day: "DD", // ${DD}

  // Time components
  hour: "HH", // ${HH}
  minute: "mm", // ${mm}
  second: "ss", // ${ss}
} as const;

export type FixedBaseStringPattern =
  typeof FixedBaseStringPatterns[keyof typeof FixedBaseStringPatterns];

const FixedVersionStringPatterns = {
  // Version components
  version: "version", // ${version}
  versionCore: "versionCore", // ${versionCore}
  versionPrerelease: "versionPre", // ${versionPre}
  versionBuild: "versionBld", // ${versionBld}

  // Tag
  tagName: "tagName", // ${tagName}
} as const;

export type FixedVersionStringPattern =
  typeof FixedVersionStringPatterns[keyof typeof FixedVersionStringPatterns];

const undecided = {
  changelog: "changelog", // ${changelog}
};
