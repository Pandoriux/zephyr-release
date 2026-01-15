import type { SemVer } from "@std/semver";
import type { ResolvedCommit } from "../commit.ts";
import type { BumpStrategyConfigOutput } from "../../schemas/configs/modules/bump-strategy-config.ts";
import type { BumpRuleOutput } from "../../schemas/configs/modules/components/bump-rule.ts";
import { countBreakingAsOptions } from "../../constants/bump-rules.ts";

export function calculateNextCoreSemVer(
  currentSemVer: SemVer,
  entries: ResolvedCommit[],
  strategy: BumpStrategyConfigOutput,
): SemVer {
  // 1. ANALYSIS PHASE: collect raw data
  const rawCounts = {
    major: { commits: 0, directBumps: 0 },
    minor: { commits: 0, directBumps: 0 },
    patch: { commits: 0, directBumps: 0 },
  };

  for (const entry of entries) {
    processBumpRule(entry, strategy.major, rawCounts.major);
    processBumpRule(entry, strategy.minor, rawCounts.minor);
    processBumpRule(entry, strategy.patch, rawCounts.patch);
  }

  // 2. CALCULATION PHASE: convert commits to bumps (apply 'commitsPerBump')
  let majorBumps = rawCounts.major.directBumps +
    calculateBumpsFromCommits(
      rawCounts.major.commits,
      strategy.major?.commitsPerBump,
    );

  let minorBumps = rawCounts.minor.directBumps +
    calculateBumpsFromCommits(
      rawCounts.minor.commits,
      strategy.minor?.commitsPerBump,
    );

  let patchBumps = rawCounts.patch.directBumps +
    calculateBumpsFromCommits(
      rawCounts.patch.commits,
      strategy.patch?.commitsPerBump,
    );

  // 3. REDIRECTION PHASE: Handle Pre-Stable (0.x.x) Logic
  if (currentSemVer.major === 0) {
    if (strategy.bumpMinorForMajorPreStable && majorBumps > 0) {
      // Downgrade Major -> Minor
      minorBumps += majorBumps;
      majorBumps = 0;
    }

    if (strategy.bumpPatchForMinorPreStable && minorBumps > 0) {
      // Downgrade Minor -> Patch
      patchBumps += minorBumps;
      minorBumps = 0;
    }
  }

  // 4. APPLICATION PHASE: The "Highest Wins" Optimization
  // A Major bump resets lower fields. A Minor bump resets Patch.
  const nextCoreSemver = { ...currentSemVer };

  if (majorBumps > 0) {
    nextCoreSemver.major += majorBumps;
    nextCoreSemver.minor = 0;
    nextCoreSemver.patch = 0;
  } else if (minorBumps > 0) {
    nextCoreSemver.minor += minorBumps;
    nextCoreSemver.patch = 0;
  } else if (patchBumps > 0) {
    nextCoreSemver.patch += patchBumps;
  }

  return nextCoreSemver;
}

/**
 * Helper to update the counts based on a specific rule.
 * Mutates the 'counter' object.
 */
function processBumpRule(
  entry: ResolvedCommit,
  rule: BumpRuleOutput,
  mutableCounter: { commits: number; directBumps: number },
) {
  // Priority 1: Breaking Changes
  if (entry.isBreaking) {
    if (rule.countBreakingAs === countBreakingAsOptions.bump) {
      mutableCounter.directBumps++;
      return;
    }
    if (rule.countBreakingAs === countBreakingAsOptions.commit) {
      mutableCounter.commits++;
      return;
    }
    // If "none", we ignore the breaking aspect and check the type below
  }

  // Priority 2: Commit Types
  if (rule.types && rule.types.includes(entry.type)) {
    mutableCounter.commits++;
  }
}

function calculateBumpsFromCommits(
  count: number,
  commitsPerBump: number,
): number {
  if (count === 0) return 0;
  if (commitsPerBump === Infinity || commitsPerBump <= 0) return 1;

  // Formula: 1st bump needs 1 commit. Subsequent bumps need N commits.
  // 5 commits, limit 5 -> 1 bump
  // 6 commits, limit 5 -> 2 bumps
  return 1 + Math.floor((count - 1) / commitsPerBump);
}
