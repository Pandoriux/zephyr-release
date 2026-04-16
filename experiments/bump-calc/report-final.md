<!-- Test Date: 2026-04-16T11:08:53Z (UTC) / 2026-04-16T18:08:53+07:00 (Local) -->
# Final QA Validation Report

Both core calculation issues have been successfully addressed in the source code!

## 1. Major Version Bumps on Stable
**Fixed In:** `src/constants/defaults/bump-strategy.ts`
**Change:** Updated `DEFAULT_MAJOR_BUMP_STRATEGY.countBreakingAs` from `"bump"` to `"commit"`. This ensures multiple breaking changes properly roll up into exactly 1 Major version bump.

**Validation Results (Stable `1.1.1`):**
```text
Scenario 1: 2 breaking, 2 feat, 2 fix
Result: 2.0.0

Scenario 2: 3 feat, 4 fix
Result: 1.2.0

Scenario 3: 10 fix
Result: 1.1.2
```

## 2. Pre-Stable Cascade Downgrade Bug
**Fixed In:** `src/tasks/calculate-next-version/core-calculations.ts`
**Change:** Prevented Major-to-Minor downgrades from cascading immediately into Patch versions. Redirection now happens at the *raw counts* level before evaluating `commitsPerBump`, ensuring mathematically precise bundle limits rather than blindly adding downstream bumps.

**Validation Results (Pre-Stable `0.1.0`):**
```text
Scenario 1: 0.1.0 with 2 breaking, 2 feat, 2 fix
Result: 0.2.0
Expected: 0.2.0

Scenario 2: 0.1.0 with 2 feat, 2 fix
Result: 0.1.1
Expected: 0.1.1
```

All logic changes have successfully passed the requirements.

---

## 3. Educational Breakdown: Why did we make this change?

If you are curious about *why* the original approach in `core-calculations.ts` failed and why moving it up fixed it, it comes down to two specific traps:

### Trap A: The Mathematical Mismatch (Bumps vs. Commits)
In the original code, the limits (`commitsPerBump`) were applied **before** redirection.
If you had 2 `feat` commits and 2 `fix` commits with `commitsPerBump: Infinity`, the logic would go:
- Calculate Minor bumps: 2 `feat` commits = **1 Minor Bump**
- Calculate Patch bumps: 2 `fix` commits = **1 Patch Bump**

Then, pre-stable redirection kicks in and says "Downgrade Minor to Patch":
- `patchBumps += minorBumps` ➡️ `1 + 1` = **2 Patch Bumps** (`0.1.2`).

This violates the `Infinity` rule! A single release should bundle all of those changes into **1 Patch Bump**. 
By moving redirection up, we combine the *Raw Commits* instead:
- Move 2 `feat` commits over... so Patch has `2 + 2 = 4 Commits`.
- Calculate Patch bumps: 4 `patch` commits = **1 Patch Bump** (`0.1.1`). 
This guarantees the limit algorithm treats the downgraded bundle correctly.

### Trap B: The Cascading Downgrade
The original code performed redirection sequentially inside the same computed variables:
```typescript
if (bumpMinor && majorBumps > 0) {
    minorBumps += majorBumps; // 1. Major becomes Minor
    majorBumps = 0;
}

if (bumpPatch && minorBumps > 0) { // 2. Traps the downgraded Major!
    patchBumps += minorBumps;     // 3. Minor becomes Patch
    minorBumps = 0;
}
```
Because a `Major` breaking change became a `Minor` bump in step 1, step 2 immediately caught it and downgraded it again! Your breaking changes were cascading all the way down to `Patch` releases and losing their severity.

By transferring raw counts using temporary variables (`origMinor.commits`), we completely bypassed the downstream trap—a downgraded Major is safely tucked into the Minor bucket, and only the *original* Minor commits are transferred to the Patch bucket.
