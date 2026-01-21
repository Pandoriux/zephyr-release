import "@js-joda/timezone";
import { createFixedBaseStringPatternContext } from "../src/tasks/string-patterns/string-pattern-context.ts";
import type { PlatformProvider } from "../src/types/providers/platform-provider.ts";

// Mock provider - only needs getNamespace and getRepositoryName for this function
const mockProvider: PlatformProvider = {
  platform: "github",
  logger: {
    info: () => {},
    startGroup: () => {},
    endGroup: () => {},
    debug: () => {},
    setFailed: () => {},
  },
  getNamespace: () => "test-org",
  getRepositoryName: () => "test-repo",
  getInputs: () => ({} as any),
  findUniquePullRequestForCommitOrThrow: async () => [],
  getTextFileOrThrow: async () => "",
};

// Fixed UTC date: 2024-01-15T14:30:45.000Z
// This is Monday, January 15, 2024 at 14:30:45 UTC
const fixedUtcDate = new Date("2024-01-15T14:30:45.000Z");

console.log("=== Testing getBaseStringPatternContext ===\n");
console.log("Input UTC Date:", fixedUtcDate.toISOString());
console.log("UTC Timestamp:", fixedUtcDate.getTime());
console.log();

// Test with different timezones
const testCases = [
  {
    timeZone: "UTC",
    name: "test-project",
    expected: {
      "YYYY-MM-DD": "2024-01-15",
      "DD-MM-YYYY": "15-01-2024",
      YYYY: "2024",
      MM: "01",
      DD: "15",
      "hh:mm:ss": "14:30:45",
      hh: "14",
      mm: "30",
      ss: "45",
    },
  },
  {
    timeZone: "America/New_York", // UTC-5 (EST) or UTC-4 (EDT) in January it's EST
    name: "test-project",
    expected: {
      "YYYY-MM-DD": "2024-01-15",
      "DD-MM-YYYY": "15-01-2024",
      YYYY: "2024",
      MM: "01",
      DD: "15",
      "hh:mm:ss": "09:30:45", // 14:30 UTC - 5 hours = 09:30 EST
      hh: "09",
      mm: "30",
      ss: "45",
    },
  },
  {
    timeZone: "Asia/Tokyo", // UTC+9
    name: "test-project",
    expected: {
      "YYYY-MM-DD": "2024-01-15",
      "DD-MM-YYYY": "15-01-2024",
      YYYY: "2024",
      MM: "01",
      DD: "15",
      "hh:mm:ss": "23:30:45", // 14:30 UTC + 9 hours = 23:30 JST
      hh: "23",
      mm: "30",
      ss: "45",
    },
  },
  {
    timeZone: "Europe/London", // UTC+0 (GMT) in January
    name: "test-project",
    expected: {
      "YYYY-MM-DD": "2024-01-15",
      "DD-MM-YYYY": "15-01-2024",
      YYYY: "2024",
      MM: "01",
      DD: "15",
      "hh:mm:ss": "14:30:45", // Same as UTC in January
      hh: "14",
      mm: "30",
      ss: "45",
    },
  },
];

for (const testCase of testCases) {
  console.log(`--- Testing timezone: ${testCase.timeZone} ---`);
  const result = createFixedBaseStringPatternContext(
    mockProvider,
    fixedUtcDate,
    {
      name: testCase.name,
      timeZone: testCase.timeZone,
    },
  );

  console.log("Result:", JSON.stringify(result, null, 2));
  console.log();

  // Compare with expected values
  console.log("Comparison:");
  const dateFields: Array<keyof typeof testCase.expected> = [
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "YYYY",
    "MM",
    "DD",
    "hh:mm:ss",
    "hh",
    "mm",
    "ss",
  ];

  let allMatch = true;
  for (const field of dateFields) {
    const actual = result[field];
    const expected = testCase.expected[field];
    const match = actual === expected;
    if (!match) allMatch = false;
    console.log(
      `  ${field}: ${actual} ${match ? "✓" : "✗"} (expected: ${expected})`,
    );
  }

  // Check other fields
  console.log(
    `  name: ${result.name} ${
      result.name === testCase.name ? "✓" : "✗"
    } (expected: ${testCase.name})`,
  );
  console.log(
    `  timeZone: ${result.timeZone} ${
      result.timeZone === testCase.timeZone ? "✓" : "✗"
    } (expected: ${testCase.timeZone})`,
  );
  console.log(
    `  namespace: ${result.namespace} ${
      result.namespace === "test-org" ? "✓" : "✗"
    } (expected: test-org)`,
  );
  console.log(
    `  repository: ${result.repository} ${
      result.repository === "test-repo" ? "✓" : "✗"
    } (expected: test-repo)`,
  );

  console.log(
    `\n${
      allMatch ? "✓ All date/time fields match!" : "✗ Some fields don't match!"
    }\n`,
  );
  console.log("---\n");
}
