# Export operation variables <!-- omit from toc -->

These variables are available to Zephyr Release internal command execution ([`command-hook`](./config-options.md#command-hook-optional)) via environment variables, and are also exported to the host platform (for example, as CI job outputs).

In GitHub: using [`@actions/core`](https://github.com/actions/toolkit/tree/main/packages/core) package, `core.exportVariable(k, v)` and `core.setOutput(k, v)`

## Table of Content <!-- omit from toc -->

- [Summary](#summary)
  - [System environment (internal commands only)](#system-environment-internal-commands-only)
  - [Zephyr Release operation variables](#zephyr-release-operation-variables)
- [Variable availability stages](#variable-availability-stages)
  - [Base (available at all time)](#base-available-at-all-time)
  - [Prepare (when target is "prepare")](#prepare-when-target-is-prepare)
    - [Pre Prepare](#pre-prepare)

## Summary

### System environment (internal commands only)

By default, all environment variables available on your system are automatically passed to internal commands:

- ...process.env.*: all environment variables currently exposed by the system/runtime.

### Zephyr Release operation variables

Zephyr Release additional operation-scoped variables. These variables are not immediately available, they become available as the operation progresses through each stage. See [Variable availability stages](#variable-availability-stages) for details on when each variable becomes available.

- **triggerCommitHash:** Trigger commit hash  
  Export: `zr-trigger-commit-hash`; Env: `ZR_TRIGGER_COMMIT_HASH`

- **triggerBranchName:** Trigger branch name  
  Export: `zr-trigger-branch-name`; Env: `ZR_TRIGGER_BRANCH_NAME`

- **workspacePath:** Workspace path  
  Export: `zr-workspace-path`; Env: `ZR_WORKSPACE_PATH`

- **configPath:** Config file path  
  Export: `zr-config-path`; Env: `ZR_CONFIG_PATH`

- **configFormat:** Config file format  
  Export: `zr-config-format`; Env: `ZR_CONFIG_FORMAT`

- **configOverride:** Config override string  
  Export: `zr-config-override`; Env: `ZR_CONFIG_OVERRIDE`

- **configOverrideFormat:** Config override format  
  Export: `zr-config-override-format`; Env: `ZR_CONFIG_OVERRIDE_FORMAT`

- **sourceMode:** Source mode string from inputs, preserved as-is (JSON stringified)  
  Export: `zr-source-mode-str`; Env: `ZR_SOURCE_MODE_STR`

- **internalSourceMode:** Internally resolved source mode object, with keys converted to camelCase and values normalized to always be an object (JSON stringified). See: [source-mode.ts](../src/schemas/inputs/source-mode.ts)  
  Export: `zr-internal-source-mode`; Env: `ZR_INTERNAL_SOURCE_MODE`

<br/>

- **config:** Resolved config object (config + override) taken directly from the user, preserved as-is (JSON stringified)  
  Export: `zr-config`; Env: `ZR_CONFIG`

- **internalConfig:** Internally resolved config object (config + override), with camelCase keys and normalized values (e.g., a prop that accepts a string or an array is normalized to an array containing a single string) (JSON stringified). See: [config.ts](../src/schemas/configs/config.ts)  
  Export: `zr-internal-config`; Env: `ZR_INTERNAL_CONFIG`

- **parsedTriggerCommit:** Parsed commit object for the latest commit that triggered the operation (JSON stringified). [View the commit object structure](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#usage)  
  Export: `zr-trigger-commit`; Env: `ZR_TRIGGER_COMMIT`

- **parsedTriggerCommitList:** Array of parsed commit objects that triggered the operation (JSON stringified). A list can contain multiple commits, for example when you push multiple local commits at once. [View the commit object structure](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#usage)  
  Export: `zr-trigger-commit-list`; Env: `ZR_TRIGGER_COMMIT_LIST`

<br/>

- **workingBranchName:** Working branch name used by the operation  
  Export: `zr-working-branch-name`; Env: `ZR_WORKING_BRANCH_NAME`

- **workingBranchRef:** Working branch ref (e.g. `refs/heads/feature-login`)  
  Export: `zr-working-branch-ref`; Env: `ZR_WORKING_BRANCH_REF`

- **workingBranchHash:** Working branch HEAD commit hash  
  Export: `zr-working-branch-hash`; Env: `ZR_WORKING_BRANCH_HASH`

- **target:** "prepare" when create/update pull request, "release" when create tag and publish release  
  Export: `zr-target`; Env: `ZR_TARGET`

- **job:** "create-pr" or "update-pr" when **target** is "prepare", "create-release" when **target** is "release"  
  Export: `zr-job`; Env: `ZR_JOB`

<br/>

- **patternContext:** **Current** string pattern context object (JSON stringified). Contains all available string pattern variables that can be used in string templates. Dynamic values (functions or async functions) are resolved at stringify time, ensuring the exported context reflects the **current** state of all pattern variables. See: [pattern-context.ts](../src/tasks/string-templates-and-patterns/pattern-context.ts)  
  **Addtionally**, this value will be updated for each stages. For example, the patternContext exposed at `command-hook > pre` might be differ compared to the patternContext exposed at `pull-request > command-hook > pre`  
  Export: `zr-pattern-context`; Env: `ZR_PATTERN_CONTEXT`

- **pullRequestNumber:** Pull request number. For "prepare" target (create/update PR), it is the PR number we are working with. For "release" target, it is the PR number we just merged into. Will be undefined if PR not found  
  **Addtionally**, this value will be updated for each stages. For example, when there is no PR open for "prepare" target yet, the "create-pr" job will create the PR, and re-update the number later on; ([`pull-request > command-hook > post`](./config-options.md#pull--command-hook-optional))  
  Export: `zr-pull-request-number`; Env: `ZR_PULL_REQUEST_NUMBER`

<br/>

- **resolvedCommitEntries:** Array of resolved commit entries (parsed and filtered) from the trigger commit to the last release (JSON stringified). Each entry contains fields such as hash, type, scope, subject, isBreaking, etc. See: [commit.ts](../src/tasks/commit.ts)  
  Export: `zr-resolved-commit-entries`; Env: `ZR_RESOLVED_COMMIT_ENTRIES`

- **currentVersion:** Current version string  
  Export: `zr-current-version`; Env: `ZR_CURRENT_VERSION`

- **nextVersion:** Next version string  
  Export: `zr-next-version`; Env: `ZR_NEXT_VERSION`

## Variable availability stages

### Base (available at all time)

These variables are available starting from the first [`command-hook > pre`](./config-options.md#command-hook-optional) command runs. See [Zephyr Release operation variables](#zephyr-release-operation-variables) for the complete list.

- **triggerCommitHash**
- **triggerBranchName**
- **workspacePath**
- **configPath**
- **configFormat**
- **configOverride**
- **configOverrideFormat**
- **sourceMode**
- **internalSourceMode**
- **config**
- **internalConfig**
- **parsedTriggerCommit**
- **parsedTriggerCommitList**
- **workingBranchName**
- **workingBranchRef**
- **workingBranchHash**
- **target**
- **job**

<br/>

- **patternContext**
- **pullRequestNumber**

### Prepare (when target is "prepare")

#### Pre Prepare

These variables are available starting from the first [`pull-request > command-hook > pre`](./config-options.md#pull--command-hook-optional) command runs.

- **resolvedCommitEntries**
- **currentVersion**
- **nextVersion**