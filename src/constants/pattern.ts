export const StringPatterns = {
  // Project info
  name: "name", // ${name}
  timeZone: "timeZone", // ${timeZone}

  // Date components (ISO format)
  fullDateISO: "YYYY-MM-DD", // ${YYYY-MM-DD}
  fullDateDayFirst: "DD-MM-YYYY", // ${DD-MM-YYYY}
  year: "YYYY", // ${YYYY}
  month: "MM", // ${MM}
  day: "DD", // ${DD}

  // Time components
  fullTime: "hh:mm:ss", // ${hh:mm:ss}
  hour: "hh", // ${hh}
  minute: "mm", // ${mm}
  second: "ss", // ${ss}

  // Version components
  version: "version", // ${version}
  versionPrimary: "versionPri", // ${versionPri}
  versionPrerelease: "versionPre", // ${versionPre}
  versionBuild: "versionBld", // ${versionBld}

  // Generated content
  changelog: "changelog", // ${changelog}
} as const;

export type StringPattern = typeof StringPatterns[keyof typeof StringPatterns];
