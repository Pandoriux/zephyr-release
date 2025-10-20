import { join } from "@std/path";

const supportedTimeZones = Intl.supportedValuesOf("timeZone");
const supportedTimeZonesEntries = supportedTimeZones.map((tz) => {
  const key = tz.replace(/[^\w]+/g, "_"); // "America/New_York" -> "America_New_York"
  return { key, value: tz };
});

// Generate supported IANA Time Zones as enum
Deno.writeTextFileSync(
  join(import.meta.dirname!, "../src/enums/timezones.ts"),
  `// This file is auto-generated. 
// No need to create or edit it manually.

/**
 * Enum for supported IANA Time Zones based on Intl.supportedValuesOf("timeZone").
 */
export const TimeZones = {
  UTC: "UTC",
${supportedTimeZonesEntries.map((e) => `  ${e.key}: "${e.value}",`).join("\n")}
} as const;

export type TimeZone = typeof TimeZones[keyof typeof TimeZones];
`,
);
