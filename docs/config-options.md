# Configuration options <!-- omit from toc -->

All possible config options of the Zephyr Release Configuration file. Most options are optional - if you don't provide them, default values will be used.  
Except: [version-files](#version-files-required)

It is recommended to use [`JSON Schema (v1)`](https://raw.githubusercontent.com/Pandoriux/zephyr-release/refs/heads/main/schemas/config-v1.json) when writing the config JSON.

To know more about templates, see [string-templates-and-patterns.md](./string-templates-and-patterns.md).

Some example [config files](https://github.com/Pandoriux/zephyr-release/tree/main/docs/examples).

## Table of Content <!-- omit from toc -->

- [Options](#options)
  - [name (Optional)](#name-optional)
  - [time-zone (Optional)](#time-zone-optional)
  - [command-hook (Optional)](#command-hook-optional)
  - [custom-string-patterns (Optional)](#custom-string-patterns-optional)
  - [initial-version (Optional)](#initial-version-optional)
  - [version-files (Required)](#version-files-required)
  - [local-files-to-commit (Optional)](#local-files-to-commit-optional)
  - [commit-types (Optional)](#commit-types-optional)
    - [commit... \> type (Required)](#commit--type-required)
    - [commit... \> section (Optional)](#commit--section-optional)
    - [commit... \> hidden (Optional)](#commit--hidden-optional)
  - [allow-release-as (Optional)](#allow-release-as-optional)
  - [bump-strategy (Optional)](#bump-strategy-optional)
    - [bump... \> major (Optional)](#bump--major-optional)
    - [bump... \> minor (Optional)](#bump--minor-optional)
    - [bump... \> patch (Optional)](#bump--patch-optional)
    - [bump... \> prerelease (Optional)](#bump--prerelease-optional)
    - [bump... \> build (Optional)](#bump--build-optional)
    - [bump... \> bump-minor-for-major-pre-stable (Optional)](#bump--bump-minor-for-major-pre-stable-optional)
    - [bump... \> bump-patch-for-minor-pre-stable (Optional)](#bump--bump-patch-for-minor-pre-stable-optional)
  - [changelog (Optional)](#changelog-optional)
    - [changelog \> writeToFile (Optional)](#changelog--writetofile-optional)
    - [changelog \> path (Optional)](#changelog--path-optional)
    - [changelog \> file-header-template (Optional)](#changelog--file-header-template-optional)
    - [changelog \> file-header-template-path (Optional)](#changelog--file-header-template-path-optional)
    - [changelog \> file-footer-template (Optional)](#changelog--file-footer-template-optional)
    - [changelog \> file-footer-template-path (Optional)](#changelog--file-footer-template-path-optional)
    - [changelog \> release-header-template (Optional)](#changelog--release-header-template-optional)
    - [changelog \> release-header-template-path (Optional)](#changelog--release-header-template-path-optional)
    - [changelog \> release-section-entry-template (Optional)](#changelog--release-section-entry-template-optional)
    - [changelog \> release-section-entry-template-path (Optional)](#changelog--release-section-entry-template-path-optional)
    - [changelog \> release-breaking-section-heading (Optional)](#changelog--release-breaking-section-heading-optional)
    - [changelog \> release-breaking-section-entry-template (Optional)](#changelog--release-breaking-section-entry-template-optional)
    - [changelog \> release-breaking-section-entry-template-path (Optional)](#changelog--release-breaking-section-entry-template-path-optional)
    - [changelog \> release-footer-template (Optional)](#changelog--release-footer-template-optional)
    - [changelog \> release-footer-template-path (Optional)](#changelog--release-footer-template-path-optional)
    - [changelog \> release-body-override (Optional)](#changelog--release-body-override-optional)
    - [changelog \> release-body-override-path (Optional)](#changelog--release-body-override-path-optional)
  - [pull-request (Optional)](#pull-request-optional)
    - [pull... \> command-hook (Optional)](#pull--command-hook-optional)
    - [pull... \> branch-name-template (Optional)](#pull--branch-name-template-optional)
    - [pull... \> label (Optional)](#pull--label-optional)
    - [pull... \> additional-label (Optional)](#pull--additional-label-optional)
    - [pull... \> title-template (Optional)](#pull--title-template-optional)
    - [pull... \> title-template-path (Optional)](#pull--title-template-path-optional)
    - [pull... \> header-template (Optional)](#pull--header-template-optional)
    - [pull... \> header-template-path (Optional)](#pull--header-template-path-optional)
    - [pull... \> body-template (Optional)](#pull--body-template-optional)
    - [pull... \> body-template-path (Optional)](#pull--body-template-path-optional)
    - [pull... \> footer-template (Optional)](#pull--footer-template-optional)
    - [pull... \> footer-template-path (Optional)](#pull--footer-template-path-optional)
  - [release (Optional)](#release-optional)
    - [release \> enabled (Optional)](#release--enabled-optional)
    - [release \> skip-release (Optional)](#release--skip-release-optional)
    - [release \> command-hook (Optional)](#release--command-hook-optional)
    - [release \> draft (Optional)](#release--draft-optional)
    - [release \> prerelease (Optional)](#release--prerelease-optional)
    - [release \> tag-name-template (Optional)](#release--tag-name-template-optional)
    - [release \> title-template (Optional)](#release--title-template-optional)
    - [release \> body-template (Optional)](#release--body-template-optional)
- [Type Definitions](#type-definitions)
  - [CommandHook](#commandhook)
  - [Command](#command)
  - [VersionFile](#versionfile)
  - [BumpRule](#bumprule)
  - [BumpRuleExtension](#bumpruleextension)
  - [SemverExtension](#semverextension)
  - [Label](#label)
  
## Options

### name (Optional)

Type: `string`  
Default: `""`

The project name used in [string templates](./string-templates-and-patterns.md) (available as `{{ name }}`).

### time-zone (Optional)

Type: `string`  
Default: `"UTC"`

IANA time zone used to format and display times.  
This value is also available for use in [string templates](./string-templates-and-patterns.md) as `{{ timeZone }}`.

### command-hook (Optional)

Type: [`CommandHook`](#commandhook)

Pre/post command lists to run around the main operation. Each command runs from the repository root.

List of exposed env variables: see [Export operation variables](./export-variables.md).

See [`CommandHook`](#commandhook) and [`Command`](#command) for the type definitions.

### custom-string-patterns (Optional)

Type: `object` (record of string to string)

Custom string patterns to use in templates. The key is the pattern name, available as `{{ <key> }}` in [string templates](./string-templates-and-patterns.md), while the resolved value is the key's value.

**Notes:** If a custom pattern key name matches an existing built-in pattern name, the built-in pattern takes precedence and the custom value will be ignored.

### initial-version (Optional)

Type: `string`  
Default: `"0.1.0"`

The initial semantic version used when a project has no existing version defined in its main version file (for example, `version.txt`, `package.json`, `deno.json`, `cargo.toml`, etc.).

This value serves as the starting version when the version field is missing, undefined, or empty — typically during the first setup or initialization of a project.

Once a version is established, subsequent releases will increment from the current value rather than this initial one.

### version-files (Required)

Type: `VersionFile | VersionFile[]`

Version file(s). Accepts a single file object or an array of file objects. If a single object, it becomes the primary file. If arrays, the first file with `primary: true` becomes the primary; if none are marked, the first file in the array will be.

The **primary file** serves as the main source of truth for the project's version.  
When reading or bumping versions, the action uses the primary file's version to determine the current and next version.  
Other version files (if any) are then synchronized to match the primary version.

See [`VersionFile`](#versionfile) for the type definition.

### local-files-to-commit (Optional)

Type: `string | string[]`

Additional local files to include in the commit when creating a pull request. Accepts `"ALL"` option or an array of paths/globs. Paths are relative to the repo root.

### commit-types (Optional)

Type: `array of objects`  
Default: `{ type: "feat", section: "Features" }, { type: "fix", section: "Bug Fixes" }, { type: "perf", section: "Performance Improvements" }, { type: "revert", section: "Reverts" }`

**Properties:** [`type`](#commit--type-required), [`section`](#commit--section-optional), [`hidden`](#commit--hidden-optional)

List of commit types that the application will track and record. Only commits with these types will be considered when calculating version bumps and generating release notes.

#### commit... > type (Required)

Type: `string`

Commit type name (e.g., "feat", "fix").

#### commit... > section (Optional)

Type: `string`

Changelog section heading for this commit type. When empty, the `type` value is used.

#### commit... > hidden (Optional)

Type: `boolean`  
Default: `false`

Exclude this commit type from changelog generation (does not affect version bump calculation).

### allow-release-as (Optional)

Type: `string | string[]`  
Default: `"ALL"`

List of commit type(s) allowed to trigger `release-as`. Accepts a single string or an array of strings.

**Special values:**

- `"ALL"`: Accepts any commit type (default behavior)
- `"BASE"`: Uses the list of commit types defined in [`commit-types`](#commit-types-optional)

You can combine `"BASE"` with other commit types. For example: `["BASE", "chore", "ci", "cd"]` will allow commits with types from `commit-types` plus `"chore"`, `"ci"`, and `"cd"`.

About `release-as`: <https://github.com/Pandoriux/zephyr-release?tab=readme-ov-file#force-a-specific-version>

### bump-strategy (Optional)

Type: `object`  
**Properties:** [`major`](#bump--major-optional), [`minor`](#bump--minor-optional), [`patch`](#bump--patch-optional), [`prerelease`](#bump--prerelease-optional), [`build`](#bump--build-optional), [`bump-minor-for-major-pre-stable`](#bump--bump-minor-for-major-pre-stable-optional), [`bump-patch-for-minor-pre-stable`](#bump--bump-patch-for-minor-pre-stable-optional)

Configuration options that determine how version numbers are calculated.

#### bump... > major (Optional)

Type: [`BumpRule`](#bumprule)  
Default: `{ count-breaking-as: "bump" }`

Strategy for major version bumps (x.0.0).

#### bump... > minor (Optional)

Type: [`BumpRule`](#bumprule)  
Default: `{ types: ["feat"] }`

Strategy for minor version bumps (0.x.0).

#### bump... > patch (Optional)

Type: [`BumpRule`](#bumprule)  
Default: `{ types: ["fix", "perf"] }`

Strategy for patch version bumps (0.0.x).

See [`BumpRule`](#bumprule) for the type definition.

#### bump... > prerelease (Optional)

Type: [`BumpRuleExtension`](#bumpruleextension)  
Default: `{}`

Strategy for bumping prerelease version (1.2.3-x.x).

See [`BumpRuleExtension`](#bumpruleextension) for the type definition.

#### bump... > build (Optional)

Type: [`BumpRuleExtension`](#bumpruleextension)  
Default: `{}`

Strategy for bumping build metadata (1.2.3+x.x).

See [`BumpRuleExtension`](#bumpruleextension) and [`SemverExtension`](#semverextension) for the type definitions.

#### bump... > bump-minor-for-major-pre-stable (Optional)

Type: `boolean`  
Default: `true`

Redirects major version bumps to minor in pre-1.0 (0.x.x).

#### bump... > bump-patch-for-minor-pre-stable (Optional)

Type: `boolean`  
Default: `false`

Redirects minor version bumps to patch in pre-1.0 (0.x.x).

### changelog (Optional)

Type: `object`  
**Properties:** [`writeToFile`](#changelog--writetofile-optional), [`path`](#changelog--path-optional), [`file-header-template`](#changelog--file-header-template-optional), [`file-header-template-path`](#changelog--file-header-template-path-optional), [`file-footer-template`](#changelog--file-footer-template-optional), [`file-footer-template-path`](#changelog--file-footer-template-path-optional), [`release-header-template`](#changelog--release-header-template-optional), [`release-header-template-path`](#changelog--release-header-template-path-optional), [`release-section-entry-template`](#changelog--release-section-entry-template-optional), [`release-section-entry-template-path`](#changelog--release-section-entry-template-path-optional), [`release-breaking-section-heading`](#changelog--release-breaking-section-heading-optional), [`release-breaking-section-entry-template`](#changelog--release-breaking-section-entry-template-optional), [`release-breaking-section-entry-template-path`](#changelog--release-breaking-section-entry-template-path-optional), [`release-footer-template`](#changelog--release-footer-template-optional), [`release-footer-template-path`](#changelog--release-footer-template-path-optional), [`release-body-override`](#changelog--release-body-override-optional), [`release-body-override-path`](#changelog--release-body-override-path-optional)

Configuration specific to changelogs. All generated changelog content are available in string templates as `{{ changelogRelease }}` (release header + body) or `{{ changelogReleaseHeader }}` and `{{ changelogReleaseBody }}`.

#### changelog > writeToFile (Optional)

Type: `boolean`  
Default: `true`

Enable/disable writing changelog to file. When disabled, changelogs are still generated for pull requests, releases and [string templates](./string-templates-and-patterns.md) but they won't be written to file.

#### changelog > path (Optional)

Type: `string`  
Default: `"CHANGELOG.md"`

Path to the file where the generated changelog will be written to, relative to the project root.

#### changelog > file-header-template (Optional)

Type: `string`  
Default: [`DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for changelog file header, using with string patterns like `{{ version }}`. Placed above any changelog content.

#### changelog > file-header-template-path (Optional)

Type: `string`

Path to text file containing changelog file header. Overrides `file-header-template` when both are provided.

#### changelog > file-footer-template (Optional)

Type: `string`

String template for changelog file footer, using with string patterns like `{{ version }}`. Placed below any changelog content.

#### changelog > file-footer-template-path (Optional)

Type: `string`

Path to text file containing changelog file footer. Overrides `file-footer-template` when both are provided.

#### changelog > release-header-template (Optional)

Type: `string`  
Default: `"## {{ tagName | md_link_compare_tag_from_current_to_latest }} ({{- YYYY }}-{{ MM }}-{{ DD }}) <!-- time-zone: {{ timeZone }} -->"`

String template for header of a changelog release, using with string patterns like `{{ version }}`.

#### changelog > release-header-template-path (Optional)

Type: `string`

Path to text file containing changelog release header. Overrides `release-header-template` when both are provided.

#### changelog > release-section-entry-template (Optional)

Type: `string`  
Default: [`DEFAULT_CHANGELOG_SECTION_ENTRY_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for each entries in the changelog release sections, using with fixed base and version string patterns. Additionally, you can use a special set of dynamic patterns which are:

- `{{ hash }}`: string
- `{{ type }}`: string
- `{{ scope }}`: string
- `{{ desc }}`: string
- `{{ body }}`: string
- `{{ footer }}`: string
- `{{ isBreaking }}`: boolean

#### changelog > release-section-entry-template-path (Optional)

Type: `string`

Path to text file containing changelog release section entry template. Overrides `release-section-entry-template` when both are provided.

#### changelog > release-breaking-section-heading (Optional)

Type: `string`  
Default: `"⚠ BREAKING CHANGES"`

Heading of a changelog release BREAKING section.

#### changelog > release-breaking-section-entry-template (Optional)

Type: `string`

Basically the same as `release-section-entry-template`, but for breaking changes specifically. If not provided, falls back to `release-section-entry-template`

#### changelog > release-breaking-section-entry-template-path (Optional)

Type: `string`

Path to text file containing changelog release breaking section entry template. Overrides `release-breaking-section-entry-template` when both are provided.

#### changelog > release-footer-template (Optional)

Type: `string`

String template for footer of a changelog release, using with string patterns.

#### changelog > release-footer-template-path (Optional)

Type: `string`

Path to text file containing changelog release footer. Overrides `release-footer-template` when both are provided.

#### changelog > release-body-override (Optional)

Type: `string`

User-provided changelog release body, available in string templates as `{{ changelogReleaseBody }}`. If set, completely ignores the built-in generation and uses this value as the content. Should only be set dynamically, not in static config.

#### changelog > release-body-override-path (Optional)

Type: `string`

Path to text file containing changelog release body override, will take precedence over `release-body-override`.

### pull-request (Optional)

Type: `object`  
**Properties:** [`command-hook`](#pull--command-hook-optional), [`branch-name-template`](#pull--branch-name-template-optional), [`label`](#pull--label-optional), [`additional-label`](#pull--additional-label-optional), [`title-template`](#pull--title-template-optional), [`title-template-path`](#pull--title-template-path-optional), [`header-template`](#pull--header-template-optional), [`header-template-path`](#pull--header-template-path-optional), [`body-template`](#pull--body-template-optional), [`body-template-path`](#pull--body-template-path-optional), [`footer-template`](#pull--footer-template-optional), [`footer-template-path`](#pull--footer-template-path-optional)

An object containing configuration options that are specific to pull request operations. These settings will only apply when working with pull requests.

#### pull... > command-hook (Optional)

Type: [`CommandHook`](#commandhook)

Pre/post command lists to run around the pull request operation. Each command runs from the repository root.

List of exposed env variables: see [Export operation variables](./export-variables.md).

#### pull... > branch-name-template (Optional)

Type: `string`  
Default: `"release/zephyr-release"`

String template for branch name that Zephyr Release uses.  
Allowed patterns to use are: [fixed base](./string-templates-and-patterns.md#base) string patterns.

#### pull... > label (Optional)

Type: `object`  
Default: `{}`

Core label used by Zephyr Release to track pull requests, managed exclusively by the tool. These labels should not be manually added or removed.

**Properties:**

- `onCreate` (Optional): Label to add when pull request is created. Can be a `string` (label name) or a [`Label`](#label) object. Default: `{ name: "release: pending", description: "The pull request is pending release.", color: "FBCA04" }`
- `onClose` (Optional): Label to add when pull request is closed and release operation has completed (replaces `onCreate` label). Can be a `string` (label name) or a [`Label`](#label) object. Default: `{ name: "release: released", description: "The pull request is closed and the release has completed.", color: "0E8A16" }`

#### pull... > additional-label (Optional)

Type: `object`  

Additional labels to attach to pull requests, managed and supplied by you. Unlike the core label, these labels are not automatically created if missing.

**Properties:**

- `onCreateAdd` (Optional): Additional labels to add when pull request is created. Can be a `string` (label name) or an array of `string` (label names).
- `onCloseAdd` (Optional): Additional labels to add when pull request is closed and release operation has completed. Can be a `string` (label name) or an array of `string` (label names).
- `onCloseRemove` (Optional): Additional labels to remove when pull request is closed and release operation has completed. Can be a `string` (label name) or an array of `string` (label names). Use `"allOnCreate"` to remove all labels added in `onCreateAdd`.

#### pull... > title-template (Optional)

Type: `string`  
Default: [`DEFAULT_PULL_REQUEST_TITLE_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for pull request title, using with string patterns like `{{ version }}`.

#### pull... > title-template-path (Optional)

Type: `string`

Path to text file containing pull request title template. Overrides `title-template` when both are provided.

#### pull... > header-template (Optional)

Type: `string | string[]`  
Default: [`DEFAULT_PULL_REQUEST_HEADER_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for pull request header, using with string patterns like `{{ version }}`. If an array is provided, it will randomly choose one from it.

#### pull... > header-template-path (Optional)

Type: `string`

Path to text file containing pull request header template. Overrides `header-template` when both are provided.

#### pull... > body-template (Optional)

Type: `string`  
Default: [`DEFAULT_PULL_REQUEST_BODY_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for pull request body, using with string patterns like `{{ changelogRelease }}`.

#### pull... > body-template-path (Optional)

Type: `string`

Path to text file containing pull request body template. Overrides `body-template` when both are provided.

#### pull... > footer-template (Optional)

Type: `string`  
Default: `"Generated with [Zephyr Release](https://github.com/Pandoriux/zephyr-release)"`

String template for pull request footer, using with string patterns.

#### pull... > footer-template-path (Optional)

Type: `string`

Path to text file containing pull request footer template. Overrides `footer-template` when both are provided.

### release (Optional)

Type: `object`  
**Properties:** [`enabled`](#release--enabled-optional), [`skip-release`](#release--skip-release-optional), [`command-hook`](#release--command-hook-optional), [`draft`](#release--draft-optional), [`prerelease`](#release--prerelease-optional), [`tag-name-template`](#release--tag-name-template-optional), [`title-template`](#release--title-template-optional), [`body-template`](#release--body-template-optional)

Configuration specific to tags and releases.

#### release > enabled (Optional)

Type: `boolean`  
Default: `true`

Enable/disable tag and release.

#### release > skip-release (Optional)

Type: `boolean`  
Default: `false`

If enabled, only the tag will be created, no release will be made.

#### release > command-hook (Optional)

Type: [`CommandHook`](#commandhook)

Pre/post command lists to run around the release operation. Each command runs from the repository root.

#### release > draft (Optional)

Type: `boolean`  
Default: `false`

If enabled, the release will be created as draft.

#### release > prerelease (Optional)

Type: `boolean`  
Default: `false`

If enabled, the release will be marked as prerelease.

#### release > tag-name-template (Optional)

Type: `string`  
Default: [`DEFAULT_TAG_NAME_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for tag name, using with string patterns like `{{ version }}`. Available in [string templates](./string-templates-and-patterns.md) as `{{ tagName }}`.  
Allowed patterns to use in template are: [fixed base](./string-templates-and-patterns.md#base) and [fixed version](./string-templates-and-patterns.md#version) string patterns.

#### release > title-template (Optional)

Type: `string`  
Default: [`DEFAULT_RELEASE_TITLE_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for release title, using with string patterns like `{{ tagName }}`.

#### release > body-template (Optional)

Type: `string`  
Default: [`DEFAULT_RELEASE_BODY_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for release body, using with string patterns like `{{ changelogRelease }}`.

## Type Definitions

### CommandHook

Type: `object`  
**Properties:**

- `timeout` (Optional): Base default timeout (ms) for all commands in `pre` and `post`, can be overridden per command. Use `Infinity`, `"Infinity"`, or `"infinity"` to never timeout (not recommended). Default: `60000` (1 min)
- `continueOnError` (Optional): Base default behavior for all commands in `pre` and `post`, can be overridden per command. Default: `false`
- `pre` (Optional): Commands to run before the operation.  
  Each command can be either a `string` or a [`Command`](#command) object.  
  List of exposed env variables: see [Export operation variables](./export-variables.md).
- `post` (Optional): Commands to run after the operation.  
  Each command can be either a `string` or a [`Command`](#command) object.  
  List of exposed env variables: see [Export operation variables](./export-variables.md).

### Command

Type: `string | object`

A command can be specified as either a string or an object.

**When specified as an object, properties:**

- `cmd` (Required): The command string to execute.
- `timeout` (Optional): Timeout in milliseconds, use Infinity to never timeout (not recommended). Defaults to `commandHook` base `timeout` value.
- `continueOnError` (Optional): Continue or stop the process on commands error. Defaults to `commandHook` base `continueOnError` value.

### VersionFile

Type: `object`  
**Properties:**

- `path` (Required): Path to the version file, relative to the project root.
- `format` (Optional): Defines the file format. Allowed values: `auto`, `json`, `jsonc`, `json5`, `yaml`, `toml`, `txt`. Default: `"auto"`
- `extractor` (Optional): Defines how the version should be located inside the parsed output. Allowed values: `auto`, `json-path`, `regex`. Default: `"auto"`
- `selector` (Required): The lookup used by the chosen extractor. For `json-path`, this is the JSON path string; for `regex`, supply the pattern.
- `primary` (Optional): Marks this file as the primary source of truth for the current version. Default: `false`

### BumpRule

Type: `object`  
**Properties:**

- `types` (Optional): Array of commit types (from base [`commit-types`](#commit-types-optional)) that count toward version bumping.
- `count-breaking-as` (Optional): How to treat breaking changes regardless of `types`. Allowed: `none`, `commit`, `bump`. Default: `"none"`  
  Usually this should only be set for a single semver level (major, minor, or patch) to avoid double counting.
- `commits-per-bump` (Optional): Number of commits required for each additional bump after the first. Use `Infinity`, `"Infinity"`, or `"infinity"` to always bump once, even if breaking changes are counted as bumps. Default: `Infinity`

Note: In JSON/JSONC files you can use `"Infinity"` or `"infinity"`; in JSON5 you can use `Infinity` directly.

### BumpRuleExtension

Type: `object`  
**Properties:**

- `enabled` (Optional): Enable/disable handling of SemVer extensions (pre-release identifiers / build metadata). Default: `false`
- `override` (Optional): Overrides extension items to use for the next version. When provided, these values take precedence over all other bump rules in `extensions`. Should only be set dynamically, not in static config.
- `treat-override-as-significant` (Optional): If set to `true`, the presence of an `override` is strictly treated as a structural change. This immediately triggers resets on any dependent version components (e.g., resetting the Build number). If `false`, overrides are treated as volatile/dynamic and ignored by reset logic. Default: `false`
- `extensions` (Optional): Specifies the items to use for SemVer extensions. Type: [`SemverExtension[]`](#semverextension)

### SemverExtension

A discriminated union based on the `type` field. Specifies the type of pre-release/build identifier/metadata.

**Type: `"static"`** — A stable label that should not change often.

- `type` (Required): `"static"`
- `value` (Required): The static string value to use. Examples: `"pre"`, `"alpha"`, `"beta"`, `"rc"`.

**Type: `"dynamic"`** — A label value that often changes per build or commit, usually sourced externally (e.g., git hash, branch name).

- `type` (Required): `"dynamic"`
- `value` (Optional): The string value to use, should be set dynamically.
- `fallback-value` (Optional): The fallback string value used when `value` is empty. If this is also empty, the identifier/metadata will be omitted from the array.

**Type: `"incremental"`** — Integer value that auto-increments by 1.

- `type` (Required): `"incremental"`
- `initial-value` (Optional): Initial integer number value. The value will auto-increment by 1 on each bump. Default: `0`
- `reset-on` (Optional): Resets the incremental value when the specified version component(s) change, could be a single or an array of options. Allowed values: `"major"`, `"minor"`, `"patch"`, `"prerelease"`, `"build"`, and `"none"`. For `"prerelease"` and `"build"`, a reset is triggered only when `"static"` values change, or when `"static"`, `"incremental"`, `"timestamp"` or `"date"` values are added or removed. Any changes to `"dynamic"` values, including their addition or removal, do not trigger a reset. Default: `"none"`

**Type: `"timestamp"`** — Integer value that changes over time, representing a specific point in time since January 1, 1970 (UTC).

- `type` (Required): `"timestamp"`
- `unit` (Optional): The time unit. `"ms"` (13 digits) or `"s"` (10 digits). Default: `"ms"`

**Type: `"date"`** — A date string that changes over time.

- `type` (Required): `"date"`
- `format` (Optional): The date format. `"YYYYMMDD"` or `"YYYY-MM-DD"`. Default: `"YYYYMMDD"`
- `time-zone` (Optional): The timezone to use for the date. If not specified, falls back to base [`time-zone`](#time-zone-optional).

### Label

Type: `object`  
**Properties:**

- `name` (Required): Label name.
- `description` (Optional): Label description.
- `color` (Optional): The hexadecimal color code for the label, in standard format with the leading #. Default: `"#ededed"`
