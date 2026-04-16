---
todo: Update `countBreakingAs` to `"commit"` in [bump-strategy.ts](file:///g:/Projects/Coding/zephyr-release/src/constants/defaults/bump-strategy.ts) for `DEFAULT_MAJOR_BUMP_STRATEGY` to ensure multiple breaking changes result in a single major bump.
test_date: 2026-04-16T11:08:53Z (UTC) / 2026-04-16T18:08:53+07:00 (Local)
---
# Bump Calculation Report

We tested the `calculateNextCoreSemVer` logic with the default configuration, starting with a current version of **1.1.1**.

### Current Default Configuration Behaviors:
- **Major**: Breaking changes are treated as `"bump"` by default, meaning every single breaking commit adds +1 directly to the major version.
- **Minor**: Commits of type `feat` count towards `minor` bump. Reaching > 0 commits yields `1` minor bump (since `commitsPerBump` is `Infinity`).
- **Patch**: Commits of type `fix` and `perf` count towards `patch` bump. Reaching > 0 commits yields `1` patch bump.

### Test Results vs Requirements

1. **Requirement:** 2 breaking, 2 feat, 2 fix will result in calculated version `2.0.0`.
   - **Does it satisfy by default?** ❌ **No.** (Yields `3.0.0` with `countBreakingAs: "bump"`)
   - **Does it satisfy with proposed fix?** ✅ **Yes.**
   - **Validation:** We just modified the experiment config to use `countBreakingAs: "commit"`. This forces the calculator to bundle both breaking changes into a single increment (due to `commitsPerBump: Infinity`). Upon running the test, the resulting version is exactly `2.0.0`!

2. **Requirement:** 3 feat, 4 fix will result in calculated version `1.2.0`.
   - **Does it satisfy?** ✅ **Yes.**
   - **Actual Result:** `1.2.0`
   - **Reason:** The logic correctly counts 3 `feat` commits, which resolves into *1 minor bump* due to `commitsPerBump: Infinity`. Since higher bumps reset lower values, the `patch` bumps from the 4 `fix` commits are discarded, resulting in exactly `1.2.0`.

3. **Additional Requirement:** 10 fix will result in `1.1.2`.
   - **Does it satisfy?** ✅ **Yes.**
   - **Actual Result:** `1.1.2`
   - **Reason:** The 10 `fix` commits count towards the `patch` version, and with `commitsPerBump: Infinity`, any number of `fix` commits results in exactly *1 patch bump*. Therefore, `1.1.1` safely updates to `1.1.2`.
