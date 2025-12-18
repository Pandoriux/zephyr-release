const SemverExtensionTypes = {
  static: "static",
  dynamic: "dynamic",
  incremental: "incremental",
  timestamp: "timestamp",
  date: "date",
} as const;

export type SemverExtensionType =
  typeof SemverExtensionTypes[keyof typeof SemverExtensionTypes];

export const SemverExtensionTimestampUnitTypes = {
  s: "s",
  ms: "ms",
} as const;

export const SemverExtensionDateFormatTypes = {
  YYYYMMDD: "YYYYMMDD",
  "YYYY-MM-DD": "YYYY-MM-DD",
} as const;
