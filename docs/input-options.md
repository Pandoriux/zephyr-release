# Input options <!-- omit from toc -->

All available input options for Zephyr Release. They are all optional - default values are used when not provided.

## Table of Content <!-- omit from toc -->

- [Options](#options)
  - [token (Optional)](#token-optional)
  - [config-path (Optional)](#config-path-optional)
  - [config-format (Optional)](#config-format-optional)
  - [config-override (Optional)](#config-override-optional)
  - [config-override-format (Optional)](#config-override-format-optional)
  - [source-mode (Optional)](#source-mode-optional)

## Options

### token (Optional)

Type: `string`  
Default: `${{ github.token }}` for github

Authentication token Zephyr Release operations.

### config-path (Optional)

Type: `string`  
Default: `"zephyr-release-config.json"`

Path to the Zephyr Release config file, relative to the project root.

### config-format (Optional)

Type: `"auto" | "json" | "jsonc" | "json5" | "yaml" | "toml"`  
Default: `"auto"`

The format of the config file.

### config-override (Optional)

Type: `string`  
Default: `""`

Config content provided as a literal block scalar (`|`). It is merged with the config file and overrides duplicate keys.

### config-override-format (Optional)

Type: `"auto" | "json" | "jsonc" | "json5" | "yaml" | "yml" | "toml"`  
Default: `"auto"`

The format of `config-override`.

### source-mode (Optional)

Type: `"remote" | "local" | object`  
Default: `"remote"`

Defines the data execution strategy and source of truth for the operation.

- **`remote`**: Optimized for performance. Operations are performed via remote API calls. This mode does not require a local checkout of the repository.
- **`local`**: Operations are performed on the runner's filesystem. This mode is required if your workflow involves local file modifications (e.g., via `command-hook`).
- **`object`**: A JSON object allowing for granular control over which specific parts of the operation use the local filesystem versus the remote API.

**Granular Configuration:**
When providing a JSON object, you can specify the mode for individual operations. Operations not explicitly defined in the object will inherit the global default, which is `remote`. To make `local` the default instead, include `{"source-mode": "local", ...}` and override specific keys as needed.

Example: `{"source-mode": "local", "version-files": "local", "changelog": "remote"}`

**Supported Keys:**
- `version-files`: Either `"local"` or `"remote"`, or an object with keys as version file path strings and values as `"local"` or `"remote"`. Any file paths not listed fall back to the default `source-mode` value.  
More about version file config in [config-options.md](./config-options.md#version-files-required)
- placeholder 2
- placeholder 3

> **Important:** If `source-mode` is set to `local` (globally or for a specific operation), a valid local workspace must exist. If required files are missing from the disk, the operation will fail with an error to prevent state mismatch between the local environment and the remote provider.