// Test Date: 2026-04-16T13:07:27Z (UTC) / 2026-04-16T20:07:27+07:00 (Local)
import { parse } from "@std/semver";
import { calculateNextExtensionsSemVer } from "../../src/tasks/calculate-next-version/extension-calculations.ts";

const tz = "UTC";
const currentSemVer = parse("1.2.0-alpha.5+hash.123")!;

console.log("=== SEMVER EXTENSIONS EXPERIMENT ===\n");

// --- SCENARIO 1: Incremental Auto-Bumping & Resetting ---
const prereleaseStrategy = {
  enabled: true,
  extensions: [
    { type: "static", value: "alpha" },
    { type: "incremental", initialValue: 0, resetOn: ["minor"] },
  ],
};

console.log("SCENARIO 1: Incremental Prerelease `alpha.5` -> ?");
console.log("- Rule: static 'alpha' + incremental (reset on minor)");

// 1A: No Core Change -> Should Increment
const nextCoreSemVerNoChange = parse("1.2.0")!;
const r1A = calculateNextExtensionsSemVer(
  currentSemVer,
  nextCoreSemVerNoChange,
  { prerelease: prereleaseStrategy, build: { enabled: false } } as any,
  tz,
);
console.log(`1A (No Core Change): 1.2.0-${r1A.prerelease?.join(".")}`);
console.log(`Expected: 1.2.0-alpha.6\n`);

// 1B: Minor Core Change -> Should Reset
const nextCoreSemVerMinorChange = parse("1.3.0")!;
const r1B = calculateNextExtensionsSemVer(
  currentSemVer,
  nextCoreSemVerMinorChange,
  { prerelease: prereleaseStrategy, build: { enabled: false } } as any,
  tz,
);
console.log(`1B (Minor Core Change): 1.3.0-${r1B.prerelease?.join(".")}`);
console.log(`Expected: 1.3.0-alpha.0\n`);

// 1C: Structural Change (Alpha -> Beta) -> Should Reset Internally
const prereleaseStrategyBeta = {
  enabled: true,
  extensions: [
    { type: "static", value: "beta" },
    { type: "incremental", initialValue: 0, resetOn: ["minor"] },
  ],
};
const r1C = calculateNextExtensionsSemVer(
  currentSemVer,
  nextCoreSemVerNoChange, // No core change, but we changed static to beta
  { prerelease: prereleaseStrategyBeta, build: { enabled: false } } as any,
  tz,
);
console.log(
  `1C (Structural Change strictly in extensions): 1.2.0-${
    r1C.prerelease?.join(".")
  }`,
);
console.log(`Expected: 1.2.0-beta.0\n`);

// --- SCENARIO 2: Dynamic and Date Values ---
const buildStrategy = {
  enabled: true,
  extensions: [
    { type: "dynamic", value: "abcdef", fallbackValue: "unknown" },
    { type: "date", format: "YYYYMMDD" },
  ],
};

console.log("SCENARIO 2: Build Metadata");
console.log("- Rule: dynamic 'abcdef' + date (YYYYMMDD)");
const r2 = calculateNextExtensionsSemVer(
  currentSemVer,
  nextCoreSemVerNoChange,
  { prerelease: { enabled: false }, build: buildStrategy } as any,
  tz,
);
console.log(`2A (Dynamic & Date Output): 1.2.0+${r2.build?.join(".")}`);
// Expected involves today's date, won't print exactly.
