import { semverComponents } from "./semver-component.ts";

export const SemverExtensionResetOnOptions = {
  ...semverComponents,

  none: "none",
} as const;

export const SemverExtensionTypes = {
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

export type SemverExtensionDateFormatType =
  typeof SemverExtensionDateFormatTypes[
    keyof typeof SemverExtensionDateFormatTypes
  ];

/**
 * Map from SemverExtensionDateFormatTypes to date format patterns of js-joda.
 */
export const SemverExtensionDateFormatMap: Record<
  SemverExtensionDateFormatType,
  string
> = {
  [SemverExtensionDateFormatTypes.YYYYMMDD]: "yyyyMMdd",
  [SemverExtensionDateFormatTypes["YYYY-MM-DD"]]: "yyyy-MM-dd",
};
