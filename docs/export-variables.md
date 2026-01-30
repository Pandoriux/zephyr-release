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

- **sourceModeStr:** Source mode object with original kebab-case keys (JSON stringified)  
  Export: `zr-source-mode-str`; Env: `ZR_SOURCE_MODE_STR`

- **sourceModeCamelCaseStr:** Source mode object with keys transformed to camelCase (JSON stringified)  
  Export: `zr-source-mode-camel-case-str`; Env: `ZR_SOURCE_MODE_CAMEL_CASE_STR`

- **configStr:** Config object with original kebab-case keys (JSON stringified)  
  Export: `zr-config-str`; Env: `ZR_CONFIG_STR`

- **configCamelCaseStr:** Config object with keys transformed to camelCase (JSON stringified)  
  Export: `zr-config-camel-case-str`; Env: `ZR_CONFIG_CAMEL_CASE_STR`

  <br/>

- **target:** "prepare" when create/update pull request, "release" when create tag and publish release  
  Export: `zr-target`; Env: `ZR_TARGET`

- **job:** "create-pr" or "update-pr" when **target** is "prepare", "create-release" when **target** is "release"  
  Export: `zr-job`; Env: `ZR_JOB`

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
- **sourceModeStr**
- **sourceModeCamelCaseStr**
- **configStr**
- **configCamelCaseStr**
- **target**
- **job**

### Prepare (when target is "prepare")

These variables are available starting from the first [`pull-request > command-hook > pre`](./config-options.md#pull--command-hook-optional) command runs.
