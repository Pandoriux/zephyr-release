// Test Date: 2026-04-16T11:08:53Z (UTC) / 2026-04-16T18:08:53+07:00 (Local)
import { parse } from "@std/semver";
import { calculateNextCoreSemVer } from "../../src/tasks/calculate-next-version/core-calculations.ts";

const currentVersion = parse("0.1.0")!;

const defaultStrategy = {
  bumpMinorForMajorPreStable: true,
  bumpPatchForMinorPreStable: true,
  major: {
    types: undefined,
    countBreakingAs: "commit", // default is "bump"
    commitsPerBump: Infinity,
  },
  minor: {
    types: ["feat"],
    countBreakingAs: "none",
    commitsPerBump: Infinity,
  },
  patch: {
    types: ["fix", "perf"],
    countBreakingAs: "none",
    commitsPerBump: Infinity,
  },
};

const mockEntries = (breaking: number, feat: number, fix: number) => {
  const arr = [];
  for (let i = 0; i < breaking; i++) {
    arr.push({ type: "chore", isBreaking: true });
  }
  for (let i = 0; i < feat; i++) arr.push({ type: "feat", isBreaking: false });
  for (let i = 0; i < fix; i++) arr.push({ type: "fix", isBreaking: false });
  return arr as any;
};

console.log("Scenario 1: 0.1.0 with 2 breaking, 2 feat, 2 fix");
const r1 = calculateNextCoreSemVer(
  { major: 0, minor: 1, patch: 0 } as any,
  mockEntries(2, 2, 2),
  defaultStrategy as any,
);
console.log(`Result: ${r1.major}.${r1.minor}.${r1.patch}`);
console.log("Expected: 0.2.0\n");

console.log("Scenario 2: 0.1.0 with 2 feat, 2 fix");
const r2 = calculateNextCoreSemVer(
  { major: 0, minor: 1, patch: 0 } as any,
  mockEntries(0, 2, 2),
  defaultStrategy as any,
);
console.log(`Result: ${r2.major}.${r2.minor}.${r2.patch}`);
console.log("Expected: 0.1.1\n");
