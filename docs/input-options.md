# Input options <!-- omit from toc -->

All available GitHub Action inputs for Zephyr Release. They are all optional - default values are used when not provided.

## Table of Content <!-- omit from toc -->

- [Options](#options)
  - [token (Optional)](#token-optional)
  - [config-path (Optional)](#config-path-optional)
  - [config-format (Optional)](#config-format-optional)
  - [config-override (Optional)](#config-override-optional)
  - [config-override-format (Optional)](#config-override-format-optional)

## Options

### token (Optional)

Type: `string`  
Default: `${{ github.token }}`

Token for Zephyr Release operations. Defaults to the repository `GITHUB_TOKEN`.

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

