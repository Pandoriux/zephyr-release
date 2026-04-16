// Test Date: 2026-04-16T11:08:53Z (UTC) / 2026-04-16T18:08:53+07:00 (Local)
import { parse } from "@std/semver";
import { calculateNextCoreSemVer } from "../../src/tasks/calculate-next-version/core-calculations.ts";

const currentVersion = parse("1.1.1")!;

const defaultStrategy = {
  treatMajorAsMinorPreStable: true,
  treatMinorAsPatchPreStable: true,
  major: {
    types: undefined,
    countBreakingAs: "commit",
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

// Scenario 1: 2 breaking, 2 feat, 2 fix
const entries1 = [
  { type: "feat", isBreaking: true },
  { type: "fix", isBreaking: true },
  { type: "feat", isBreaking: false },
  { type: "feat", isBreaking: false }, // Wait, 2 feat? Let's say 2 non-breaking feats, but the first is breaking so we have 2 breaking, 2 feat, 2 fix total? Let's explicitly define 2 breaking (say 'chore!'), 2 feat, 2 fix.
];

const mockEntries = (breaking: number, feat: number, fix: number) => {
  const arr = [];
  for (let i = 0; i < breaking; i++) {
    arr.push({ type: "chore", isBreaking: true });
  }
  for (let i = 0; i < feat; i++) arr.push({ type: "feat", isBreaking: false });
  for (let i = 0; i < fix; i++) arr.push({ type: "fix", isBreaking: false });
  return arr as any;
};

console.log("Scenario 1: 2 breaking, 2 feat, 2 fix");
const r1 = calculateNextCoreSemVer(
  { major: 1, minor: 1, patch: 1 } as any,
  mockEntries(2, 2, 2),
  defaultStrategy as any,
);
console.log(`Result: ${r1.major}.${r1.minor}.${r1.patch}`);

console.log("\nScenario 2: 3 feat, 4 fix");
const r2 = calculateNextCoreSemVer(
  { major: 1, minor: 1, patch: 1 } as any,
  mockEntries(0, 3, 4),
  defaultStrategy as any,
);
console.log(`Result: ${r2.major}.${r2.minor}.${r2.patch}`);

console.log("\nScenario 3: 10 fix");
const r3 = calculateNextCoreSemVer(
  { major: 1, minor: 1, patch: 1 } as any,
  mockEntries(0, 0, 10),
  defaultStrategy as any,
);
console.log(`Result: ${r3.major}.${r3.minor}.${r3.patch}`);
