export const FixedBaseStringPatterns = {
  // Project info
  name: "name", // ${name}
  timeZone: "timeZone", // ${timeZone}
  namespace: "namespace", // ${namespace}
  repository: "repository", // ${repository}

  // Date components (ISO format)
  fullDateISO: "YYYY-MM-DD", // ${YYYY-MM-DD}
  fullDateDayFirst: "DD-MM-YYYY", // ${DD-MM-YYYY}
  year: "YYYY", // ${YYYY}
  month: "MM", // ${MM}
  day: "DD", // ${DD}

  // Time components
  fullTime: "HH:mm:ss", // ${HH:mm:ss}
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
