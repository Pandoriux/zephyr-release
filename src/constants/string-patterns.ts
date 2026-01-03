export const BaseStringPatterns = {
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

export type BaseStringPattern =
  typeof BaseStringPatterns[keyof typeof BaseStringPatterns];

export const AfterVersionStringPatterns = {
  // Version components
  version: "version", // ${version}
  versionPrimary: "versionPri", // ${versionPri}
  versionPrerelease: "versionPre", // ${versionPre}
  versionBuild: "versionBld", // ${versionBld}

  // Generated content
  changelog: "changelog", // ${changelog}
  tagName: "tagName", // ${tagName}. Also support dynamic modifier ${tagName:prev:<N>}
} as const;
