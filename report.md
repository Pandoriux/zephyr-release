# Terminology Refactor Report

## Changes Applied

### `src/constants/string-patterns.ts`

- Renamed `FixedPreviousVersionStringPatterns` → `FixedCurrentVersionStringPatterns` and updated all keys:
  - `previousVersion` → `currentVersion` (value: `"currentVersion"`)
  - `previousVersionCore` → `currentVersionCore` (value: `"currentVersionCore"`)
  - `previousVersionPrerelease` → `currentVersionPrerelease` (value: `"currentVersionPre"`)
  - `previousVersionBuild` → `currentVersionBuild` (value: `"currentVersionBld"`)
- Renamed exported type `FixedPreviousVersionStringPattern` → `FixedCurrentVersionStringPattern`
- Updated `FixedVersionStringPatterns` values to reflect the new `nextVersion` template pattern names:
  - `"version"` → `"nextVersion"`
  - `"versionCore"` → `"nextVersionCore"`
  - `"versionPre"` → `"nextVersionPre"`
  - `"versionBld"` → `"nextVersionBld"`

---

### `src/types/operation-variables.ts`

- Renamed `previousVersion: string` → `currentVersion: string` in `OperationVariables`
- Renamed `version: string` → `nextVersion: string` in `OperationVariables`
- Updated `PrePrepareOperationVariables` pick keys: `"previousVersion"` → `"currentVersion"`, `"version"` → `"nextVersion"`
- Updated `PrePublishOperationVariables` pick key: `"version"` → `"nextVersion"`

---

### `src/tasks/calculate-next-version/previous-version.ts`

- Renamed exported function `getPreviousVersion` → `getCurrentVersion`
- Renamed internal types `GetPreviousVersionInputsParams` → `GetCurrentVersionInputsParams`, `GetPreviousVersionConfigParams` → `GetCurrentVersionConfigParams`
- Updated log message: `"Getting previous version..."` → `"Getting current version..."`

---

### `src/tasks/calculate-next-version/calculate-version.ts`

- Renamed `previousVersion` parameter → `currentVersion` in `calculateNextVersion`
- Updated all internal uses of `previousVersion` → `currentVersion` within the function body (guards, comparisons, log messages)
- Renamed exported function `compareVersionToPreviousVersion` → `compareVersionToCurrentVersion`
- Renamed `version` parameter → `nextVersion` in `compareVersionToCurrentVersion`
- Renamed `previousVersion` parameter → `currentVersion` in `compareVersionToCurrentVersion`
- Updated local variables `versionStr` → `nextVersionStr`, `previousVersionStr` → `currentVersionStr`
- Updated all log/error messages to use "current version" instead of "previous version"

---

### `src/tasks/string-templates-and-patterns/pattern-context.ts`

- Updated import: `FixedPreviousVersionStringPattern` → `FixedCurrentVersionStringPattern`
- Renamed function `createFixedPreviousVersionStringPatternContext` → `createFixedCurrentVersionStringPatternContext`
- Updated parameter `previousVersion?` → `currentVersion?` and all internal references
- Updated pattern context object keys: `previousVersion` → `currentVersion`, `previousVersionCore` → `currentVersionCore`, `previousVersionPre` → `currentVersionPre`, `previousVersionBld` → `currentVersionBld`
- Updated `createFixedVersionStringPatternContext`: parameter `version` → `nextVersion`; object keys: `version` → `nextVersion`, `versionCore` → `nextVersionCore`, `versionPre` → `nextVersionPre`, `versionBld` → `nextVersionBld`

---

### `src/tasks/export-variables.ts`

- In `exportPrePrepareOperationVariables`: renamed parameter `previousVersion` → `currentVersion`, `version` → `nextVersion`; updated exported object keys to match
- In `exportPrePublishOperationVariables`: renamed parameter `version` → `nextVersion`; updated exported object key to match

---

### `src/tasks/runtime-override.ts`

- Updated import: `createFixedPreviousVersionStringPatternContext` → `createFixedCurrentVersionStringPatternContext`
- In `SynchronizeRuntimeStateParams`: renamed field `version?` → `nextVersion?`, `previousVersion?` → `currentVersion?`
- In `synchronizeRuntimeStateAfterOverride`: updated destructuring and all references accordingly

---

### `src/workflows/auto.ts`

- Updated imports: `compareVersionToPreviousVersion` → `compareVersionToCurrentVersion`, `getPreviousVersion` → `getCurrentVersion`, `createFixedPreviousVersionStringPatternContext` → `createFixedCurrentVersionStringPatternContext`
- Renamed local variable `previousVersion` → `currentVersion` throughout
- Updated all `synchronizeRuntimeStateAfterOverride` call sites: `version: nextVersion` → `nextVersion: nextVersion`, `previousVersion` → `currentVersion`
- Updated log messages: "Get previous version" → "Get current version", "previous version" → "current version"

---

### `src/workflows/review.prepare.ts`

- Same changes as `auto.ts` — updated imports, local variable `previousVersion` → `currentVersion`, all call sites adjusted

---

### `src/workflows/review.publish.ts`

- Renamed local variable `version` → `nextVersion` (the version extracted from the primary version file for a release publish)
- Updated all call sites: `createFixedVersionStringPatternContext`, `exportPrePublishOperationVariables`, and `synchronizeRuntimeStateAfterOverride` use `nextVersion`

---

### `docs/export-variables.md`

- Updated export variable entries in **Pre Prepare** section:
  - `previousVersion` → `currentVersion`; `zr-previous-version` → `zr-current-version`; `ZR_PREVIOUS_VERSION` → `ZR_CURRENT_VERSION`
  - `version` → `nextVersion`; `zr-version` → `zr-next-version`; `ZR_VERSION` → `ZR_NEXT_VERSION`
- Updated **Pre Publish** section:
  - `version` → `nextVersion`; `zr-version` → `zr-next-version`; `ZR_VERSION` → `ZR_NEXT_VERSION`

---

### `docs/string-templates-and-patterns.md`

- Renamed section **"Previous Version"** → **"Current Version"**
- Updated all `{{ previousVersion* }}` pattern names to `{{ currentVersion* }}`
- Updated `{{ version }}` → `{{ nextVersion }}`, `{{ versionCore }}` → `{{ nextVersionCore }}`, `{{ versionPre }}` → `{{ nextVersionPre }}`, `{{ versionBld }}` → `{{ nextVersionBld }}`
- Updated example templates in the intro to use `{{ nextVersion }}`

---

### `docs/config-options.md`

- Updated all description lines that used `{{ version }}` as an example pattern to `{{ nextVersion }}`: in sections `review > title-template`, `review > header-template`, `changelog > file-header-template`, `changelog > file-footer-template`, `changelog > release-header-template`, `commit > header-template`, `tag > name-template`

---

## Not Sure (Manual Review Required)

### `src/workflows/review.publish.ts` — local variable `nextVersion`

**File:** `src/workflows/review.publish.ts`  
**Line:** ~55  
**Snippet:**
```ts
const nextVersion = await getVersionSemVerFromVersionFile(
  primaryVersionFile,
  runSettings.inputs.sourceMode,
  provider,
  runSettings.inputs.workspacePath,
  runSettings.inputs.triggerCommitHash,
);
```

**Context:** In `review.publish.ts`, the version is read from the primary version file **at the point the proposal is being merged** — meaning it is the version that was already written into the file by the prepare phase. Semantically this could be called the "release version" or "next version" (it IS the calculated next version, now committed). The rename to `nextVersion` is directionally correct. However, note this variable is NOT derived from `calculateNextVersion()` but directly read from the file — so it could be argued it's the "resolved release version." No change is recommended, but flagging for your awareness.

### `src/tasks/calculate-next-version/previous-version.ts` — file name

**File:** `src/tasks/calculate-next-version/previous-version.ts`  
**Context:** The file is still named `previous-version.ts` even though the exported function is now `getCurrentVersion`. You may want to rename the file to `current-version.ts` for consistency — this was not done as file renames were outside the scope of the variable/symbol-level refactor.
