<!-- Test Date: 2026-04-16T11:08:53Z (UTC) / 2026-04-16T18:08:53+07:00 (Local) -->
# Bump Calculation Report (Pre-Stable / 0.x.x)

We tested the `calculateNextCoreSemVer` logic handling pre-stable versions (`0.1.0`), and specifically its cascade-downgrade logic (`bumpMinorForMajorPreStable`, `bumpPatchForMinorPreStable`).

### Test Results vs Requirements

1. **Requirement:** Current `0.1.0` with *2 breaking, 2 feat, 2 fix* results in `0.2.0`
   - **Does it satisfy?** ❌ **No.** 
   - **Actual Result:** Yields `0.1.4` (Or `0.1.3` depending on `commit` vs `bump` settings).
   
2. **Requirement:** Current `0.1.0` with *2 feat, 2 fix* results in `0.1.1`
   - **Does it satisfy?** ❌ **No.** 
   - **Actual Result:** Yields `0.1.2`.

### The Core Bug: Cascade & Math Order

The existing logic has two main flaws inside the `REDIRECTION PHASE`:

1. **Unintended Cascading:**
   When `majorBumps` are downgraded to `minorBumps`, the cascading logic executes the next `if()` statement (`strategy.bumpPatchForMinorPreStable && minorBumps > 0`). This grabs the newly converted Minor bumps (the breaking changes) and forcefully downgrades them *again* into Patch bumps! Breaking changes end up as Patch bumps instead of safely stopping at Minor bumps.

2. **Late Redirection (After Limiting instead of Before):**
   The redirects happen *after* `commitsPerBump` has been evaluated. Bumps are then added mathematically: `patchBumps += minorBumps`. 
   If you have 1 minor bump (from feats) and 1 patch bump (from fixes), adding them together results in `2 patch bumps`, which increments your patch version twice (`0.1.0 -> 0.1.2`). 
   If handled properly, they should both be tracked as bundled patch-level commits *before* determining bumps, resulting in exactly 1 patch release.

### How You Should Fix It

Do **NOT** perform redirection on `majorBumps` or `minorBumps` inside the `application phase`. 

Instead, perform redirection at the **RAW COUNTS** level, right *before* `calculateBumpsFromCommits` executes, and ensure they do not cascade. For example:

```typescript
// 1. ANALYSIS PHASE
const rawCounts = { major: { commits: 0, directBumps: 0 }, ... };

// 1.5 REDIRECTION PHASE (On Raw Counts)
if (currentSemVer.major === 0) {
  const origMajor = { ...rawCounts.major };
  const origMinor = { ...rawCounts.minor };

  if (strategy.bumpMinorForMajorPreStable) {
    // Transfer Major -> Minor
    rawCounts.major = { commits: 0, directBumps: 0 };
    rawCounts.minor.commits += origMajor.commits;
    rawCounts.minor.directBumps += origMajor.directBumps;
  }

  if (strategy.bumpPatchForMinorPreStable) {
    // Transfer ORIG Minor -> Patch (DO NOT cascade the downgraded majors)
    rawCounts.minor.commits -= origMinor.commits;
    rawCounts.minor.directBumps -= origMinor.directBumps;
    rawCounts.patch.commits += origMinor.commits;
    rawCounts.patch.directBumps += origMinor.directBumps;
  }
}

// 2. CALCULATION PHASE
// Calculate limits on the merged commits...
```

With this logic fix in place (alongside your previous `countBreakingAs: "commit"`), all scenarios align correctly with `0.2.0` and `0.1.1`.
