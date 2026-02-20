# Export operation variables

These variables are available to Zephyr Release internal command execution ([`command-hook`](./config-options.md#command-hook-optional)) via environment variables, and are also exported to the host platform (for example, as CI job outputs).

In GitHub: using [`@actions/core`](https://github.com/actions/toolkit/tree/main/packages/core) package, `core.exportVariable(k, v)` and `core.setOutput(k, v)`

## System environment (internal commands only)

By default, all environment variables available on your system are automatically passed to internal commands:

- ...process.env.*: all environment variables currently exposed by the system/runtime.

## Zephyr Release operation variables

Zephyr Release additional operation-scoped variables. These variables are not immediately available, they become available as the operation progresses through each stage.

### Base (available at all time)

These variables are available starting from the first [`command-hook > pre`](./config-options.md#command-hook-optional) command runs.

- **triggerCommitHash:** Trigger commit hash  
  Export: zr-trigger-commit-hash; Env: ZR_TRIGGER_COMMIT_HASH

- **triggerBranchName:** Trigger branch name  
  Export: zr-trigger-branch-name; Env: ZR_TRIGGER_BRANCH_NAME

- **workspacePath:** Workspace path  
  Export: zr-workspace-path; Env: ZR_WORKSPACE_PATH

- **configPath:** Config file path  
  Export: zr-config-path; Env: ZR_CONFIG_PATH

- **configFormat:** Config file format  
  Export: zr-config-format; Env: ZR_CONFIG_FORMAT

- **configOverride:** Config override string  
  Export: zr-config-override; Env: ZR_CONFIG_OVERRIDE

- **configOverrideFormat:** Config override format  
  Export: zr-config-override-format; Env: ZR_CONFIG_OVERRIDE_FORMAT

- **sourceMode:** Source mode string from inputs, preserved as-is (JSON stringified)  
  Export: zr-source-mode-str; Env: ZR_SOURCE_MODE_STR

- **internalSourceMode:** Internally resolved source mode object (JSON stringified). The object has the shape `{ mode: "remote" | "local", overrides?: Record<string, "remote" | "local"> }`, where `overrides` is a map of file paths to mode values. See [source mode docs](./input-options.md#source-mode-optional).  
  Export: zr-internal-source-mode; Env: ZR_INTERNAL_SOURCE_MODE

<br>

- **config:** Resolved config object (config + override) taken directly from the user, preserved as-is (JSON stringified)  
  Export: zr-config; Env: ZR_CONFIG

- **internalConfig:** Internally resolved config object (config + override), with camelCase keys and normalized values (e.g., a prop that accepts a string or an array is normalized to an array containing a single string) (JSON stringified). See: [config.ts](../src/schemas/configs/config.ts)  
  Export: zr-internal-config; Env: ZR_INTERNAL_CONFIG

- **parsedTriggerCommit:** Parsed commit object for the latest commit that triggered the operation (JSON stringified). [View the commit object structure](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#usage)  
  Export: zr-trigger-commit; Env: ZR_TRIGGER_COMMIT

- **parsedTriggerCommitList:** Array of parsed commit objects that triggered the operation (JSON stringified). A list can contain multiple commits, for example when you push multiple local commits at once. [View the commit object structure](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#usage)  
  Export: zr-trigger-commit-list; Env: ZR_TRIGGER_COMMIT_LIST

<br>

- **workingBranchName:** Working branch name used by the operation  
  Export: zr-working-branch-name; Env: ZR_WORKING_BRANCH_NAME

- **workingBranchRef:** Working branch ref (e.g. `refs/heads/feature-login`)  
  Export: zr-working-branch-ref; Env: ZR_WORKING_BRANCH_REF

- **workingBranchHash:** Working branch HEAD commit hash  
  Export: zr-working-branch-hash; Env: ZR_WORKING_BRANCH_HASH

<br>

- **operation:** "propose" when create/update pull request, "release" when create tag and publish release  
  Export: zr-operation; Env: ZR_OPERATION

- **jobs:** Stringified array of jobs; "create-pr" or "update-pr" when **operation** is "propose", "create-tag" and/or "create-release-note" when **operation** is "release"  
  Export: zr-jobs; Env: ZR_JOBS

### Dynamic (available at all time)

These variables are exposed continuously throughout the operation, and their values are updated for each stage. Additionally, although they are labeled as available at all times, a value might or might not exist during some stages (such as `pullRequestNumber`).

- **patternContext:** **Current** string pattern context object (JSON stringified). Contains all available string pattern variables that can be used in string templates. Dynamic values (functions or async functions) are resolved at stringify time, ensuring the exported context reflects the **current** state of all pattern variables. See: [pattern-context.ts](../src/tasks/string-templates-and-patterns/pattern-context.ts)  
  For example, the patternContext exposed at `command-hook > pre` might be differ compared to the patternContext exposed at `pull-request > command-hook > pre`  
  Export: zr-pattern-context; Env: ZR_PATTERN_CONTEXT

- **pullRequestNumber:** Pull request number. For "propose" operation (create/update PR), it is the PR number we are working with. For "release" operation, it is the PR number we just merged into. Will be undefined if PR not found  
  For example, when there is no PR open for "propose" operation yet, the initial value will be undefined. Then the "create-pr" job will create the PR, and re-update the number. The value can now be accessed in the next cmds like ([`pull-request > command-hook > post`](./config-options.md#pull--command-hook-optional))  
  Export: zr-pull-request-number; Env: ZR_PULL_REQUEST_NUMBER

### Propose (when operation is "propose")

#### Pre Propose

These variables are available starting from the first [`pull-request > command-hook > pre`](./config-options.md#pull--command-hook-optional) command runs.

- **resolvedCommitEntries:** Array of resolved commit entries (parsed and filtered) from the trigger commit to the last release (JSON stringified). Each entry contains fields such as hash, type, scope, subject, isBreaking, etc. See: [commit.ts](../src/tasks/commit.ts)  
  Export: zr-resolved-commit-entries; Env: ZR_RESOLVED_COMMIT_ENTRIES

- **previousVersion:** Current version string  
  Export: zr-current-version; Env: ZR_CURRENT_VERSION

- **version:** Next version string  
  Export: zr-next-version; Env: ZR_NEXT_VERSION

#### Post Propose

These variables are available starting from the first [`pull-request > command-hook > post`](./config-options.md#pull--command-hook-optional) command runs.

- **committedFilePaths:** Stringified array of file paths that have been committed  
  Export: zr-committed-file-paths; Env: ZR_COMMITTED_FILE_PATHS

### Release (when operation is "release")

#### Pre Release

- **version:** The version string used for the release  
  Export: zr-next-version; Env: ZR_NEXT_VERSION

#### Post Release

These variables are available starting from the first [`release > command-hook > post`](./config-options.md#release--command-hook-optional) command runs.

- **tagHash:** Git tag hash created for the release  
  Export: zr-tag-hash; Env: ZR_TAG_HASH

- **releaseId:** Platform-specific release identifier (for example, GitHub release ID). May be empty if no release was created (for example, when `skipReleaseNote` is enabled or the platform does not support releases)  
  Export: zr-release-id; Env: ZR_RELEASE_ID

- **releaseUploadUrl:** Platform-specific upload URL for release assets (for example, GitHub release upload URL). May be empty if not supported or no release was created  
  Export: zr-release-upload-url; Env: ZR_RELEASE_UPLOAD_URL
