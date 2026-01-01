# Export operation variables <!-- omit from toc -->

These variables are available to Zephyr Release internal command execution ([`command-hook`](./config-options.md#command-hook-optional)) via environment variables, and are also exported to the host platform (for example, as CI job outputs).

In GitHub: using [`@actions/core`](https://github.com/actions/toolkit/tree/main/packages/core) package, `core.exportVariable(k, v)` and `core.setOutput(k, v)`

## Table of Content <!-- omit from toc -->

- [Summary](#summary)
- [Variables available to internal commands and external system](#variables-available-to-internal-commands-and-external-system)
  - [System environment (internal commands only)](#system-environment-internal-commands-only)
  - [Zephyr Release operation variables](#zephyr-release-operation-variables)
    - [Base (available at all time)](#base-available-at-all-time)

## Summary

... DONT WRITE ANYTHING HERE FOR NOW

## Variables available to internal commands and external system

### System environment (internal commands only)

By default, all environment variables available on your system are automatically passed to internal commands:

- ...process.env.*: all environment variables currently exposed by the system/runtime.

### Zephyr Release operation variables

Zephyr Release additional operation-scoped variables. These variables are not immediately available, they become available as the operation progresses through each stage.

#### Base (available at all time)

These variables are available before the first [`command-hook > pre`](./config-options.md#commandhook) command runs.

- **target:** `"prepare"` or `"release"`  
Export: `zr_target`, Env: `ZR_TARGET`
- **jobs:** `"create-pr"` or `"update-pr"` when **target** is `"prepare"`, `"create-release"` when **target** is `"release"`  
**Export:** zr_jobs  
**Env:** ZR_JOBS
- `nextVersion`: next semantic version string
- `changelog`: generated changelog content (string)
