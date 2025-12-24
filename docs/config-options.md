# Configuration options <!-- omit from toc -->

All possible config options of the Zephyr Release Configuration file. They are all optional - if you don't provide any options or don't have a config file, default values will be used.

It is recommended to use `schema link to be inserted later` when writing the config JSON.

Some example config JSON files: `example links to be inserted later`

## Table of Content <!-- omit from toc -->

- [Options](#options)
  - [name (Optional)](#name-optional)
  - [time-zone (Optional)](#time-zone-optional)
  - [command-hook (Optional)](#command-hook-optional)
    - [CommandHook](#commandhook)
      - [Command Object](#command-object)
  - [initial-version (Optional)](#initial-version-optional)
  - [version-files (Required)](#version-files-required)
    - [VersionFile](#versionfile)
  - [files-to-commit (Optional)](#files-to-commit-optional)
  - [commit-types (Optional)](#commit-types-optional)
    - [commit... \> type (Required)](#commit--type-required)
    - [commit... \> section (Optional)](#commit--section-optional)
    - [commit... \> hidden (Optional)](#commit--hidden-optional)
  - [bump-strategy (Optional)](#bump-strategy-optional)
    - [bump... \> major (Optional)](#bump--major-optional)
    - [bump... \> minor (Optional)](#bump--minor-optional)
    - [bump... \> patch (Optional)](#bump--patch-optional)
      - [BumpRule](#bumprule)
    - [bump... \> prerelease (Optional)](#bump--prerelease-optional)
      - [BumpRulePrerelease](#bumpruleprerelease)
    - [bump... \> build (Optional)](#bump--build-optional)
      - [BumpRuleBuild](#bumprulebuild)
      - [SemverExtension](#semverextension)
    - [bump... \> bump-minor-for-major-pre-stable (Optional)](#bump--bump-minor-for-major-pre-stable-optional)
    - [bump... \> bump-patch-for-minor-pre-stable (Optional)](#bump--bump-patch-for-minor-pre-stable-optional)
  - [changelog (Optional)](#changelog-optional)
    - [changelog \> enabled (Optional)](#changelog--enabled-optional)
    - [changelog \> command-hook (Optional)](#changelog--command-hook-optional)
    - [changelog \> content-body-override (Optional)](#changelog--content-body-override-optional)
    - [changelog \> path (Optional)](#changelog--path-optional)
    - [changelog \> header-pattern (Optional)](#changelog--header-pattern-optional)
    - [changelog \> header-pattern-path (Optional)](#changelog--header-pattern-path-optional)
    - [changelog \> footer-pattern (Optional)](#changelog--footer-pattern-optional)
    - [changelog \> footer-pattern-path (Optional)](#changelog--footer-pattern-path-optional)
    - [changelog \> heading-pattern (Optional)](#changelog--heading-pattern-optional)
    - [changelog \> body-pattern (Optional)](#changelog--body-pattern-optional)
    - [changelog \> body-pattern-path (Optional)](#changelog--body-pattern-path-optional)
  - [pull-request (Optional)](#pull-request-optional)
    - [pull... \> enabled (Optional)](#pull--enabled-optional)
    - [pull... \> command-hook (Optional)](#pull--command-hook-optional)
    - [pull... \> branch-name-pattern (Optional)](#pull--branch-name-pattern-optional)
    - [pull... \> labels-on-create (Optional)](#pull--labels-on-create-optional)
    - [pull... \> labels-on-close (Optional)](#pull--labels-on-close-optional)
    - [pull... \> title-pattern (Optional)](#pull--title-pattern-optional)
    - [pull... \> header-pattern (Optional)](#pull--header-pattern-optional)
    - [pull... \> body-pattern (Optional)](#pull--body-pattern-optional)
    - [pull... \> body-pattern-path (Optional)](#pull--body-pattern-path-optional)
    - [pull... \> footer-pattern (Optional)](#pull--footer-pattern-optional)
      - [Label Object](#label-object)
  - [release (Optional)](#release-optional)
    - [release \> enabled (Optional)](#release--enabled-optional)
    - [release \> skip-release (Optional)](#release--skip-release-optional)
    - [release \> command-hook (Optional)](#release--command-hook-optional)
    - [release \> draft (Optional)](#release--draft-optional)
    - [release \> prerelease (Optional)](#release--prerelease-optional)
    - [release \> tag-name-pattern (Optional)](#release--tag-name-pattern-optional)
    - [release \> title-pattern (Optional)](#release--title-pattern-optional)
    - [release \> body-pattern (Optional)](#release--body-pattern-optional)
- [String Patterns](#string-patterns)
  - [User-defined](#user-defined)
  - [App-defined](#app-defined)

## Options

### name (Optional)

Type: `string`  
Default: `""`

The project name used in naming patterns (available as `${name}`).

### time-zone (Optional)

Type: `string`  
Default: `"UTC"`

IANA time zone used to format and display times.  
This value is also available for use in naming patterns as `${timeZone}`.

### command-hook (Optional)

Type: [`CommandHook`](#commandhook)

Pre/post command lists to run around the main operation. Each command runs from the repository root.

#### CommandHook

Type: `object`  
**Properties:**

- `pre` (Optional): Commands to run before the operation.  
  Each command can be either a `string` or a [`Command`](#command-object) object.
- `post` (Optional): Commands to run after the operation.  
  Each command can be either a `string` or a [`Command`](#command-object) object.

##### Command Object

Type: `object`  
**Properties:**

- `cmd` (Required): The command string to execute.
- `timeout` (Optional): Timeout in milliseconds. Default: `60000` (1 minute)

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

#### VersionFile

Type: `object`  
**Properties:**

- `path` (Required): Path to the version file, relative to the project root.
- `format` (Optional): Defines the file format. Allowed values: `auto`, `json`, `jsonc`, `json5`, `yaml`, `toml`, `txt`. Default: `"auto"`
- `extractor` (Optional): Defines how the version should be located inside the parsed output. Allowed values: `auto`, `json-path`, `regex`. Default: `"auto"`
- `selector` (Required): The lookup used by the chosen extractor. For `json-path`, this is the JSON path string; for `regex`, supply the pattern.
- `primary` (Optional): Marks this file as the primary source of truth for the current version. Default: `false`

### files-to-commit (Optional)

Type: `"base" | "all" | string[]`  
Default: `"base"`

Files to include in the commit. Accepts `base`, `all` or an array of paths/globs. Paths are relative to the repo root.

- **`base`**: Includes files affected by the script, such as:
  - Changelog file (defined in [`changelog > file-path`](#changelog--file-path-optional))
  - Version files (defined in [`version-files`](#version-files-required))
  
- **`all`**: Includes all files from `base` plus optionally changed files created by commands from:
  - Base [`command-hook`](#command-hook-optional)
  - [`changelog > command-hook`](#changelog--command-hook-optional)
  - [`pull-request > command-hook`](#pull--command-hook-optional)
  - [`release > command-hook`](#release--command-hook-optional)

- **Array of options/paths/globs**: Allows `base`, `all` or/and paths, globs. For example, `["base", "docs/**/*.md", "dist/**"]` or `["CHANGELOG.md", "package.json"]`.

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
Default: `""`

Changelog section heading for this commit type. When empty, the `type` value is used.

#### commit... > hidden (Optional)

Type: `boolean`  
Default: `false`

Exclude this commit type from changelog generation (does not affect version bump calculation).

### bump-strategy (Optional)

Type: `object`  
**Properties:** [`major`](#bump--major-optional), [`minor`](#bump--minor-optional), [`patch`](#bump--patch-optional), [`prerelease`](#bump--prerelease-optional), [`build`](#bump--build-optional), [`bump-minor-for-major-pre-stable`](#bump--bump-minor-for-major-pre-stable-optional), [`bump-patch-for-minor-pre-stable`](#bump--bump-patch-for-minor-pre-stable-optional)

Configuration options that determine how version numbers are calculated.

#### bump... > major (Optional)

Type: [`BumpRule`](#bumprule)  
Default: `{ types: [], count-breaking-as: "bump", commits-per-bump: 1 }`

Strategy for major version bumps (x.0.0).

#### bump... > minor (Optional)

Type: [`BumpRule`](#bumprule)  
Default: `{ types: ["feat"], commits-per-bump: 1 }`

Strategy for minor version bumps (0.x.0).

#### bump... > patch (Optional)

Type: [`BumpRule`](#bumprule)  
Default: `{ types: ["fix", "perf"], commits-per-bump: 1 }`

Strategy for patch version bumps (0.0.x).

##### BumpRule

Type: `object`  
**Properties:**

- `types` (Optional): Array of commit types (from base [`commit-types`](#commit-types-optional)) that count toward version bumping. Default: `[]`
- `count-breaking-as` (Optional): How to treat breaking changes regardless of `types`. Allowed: `none`, `commit`, `bump`. Default: `"none"`  
  Usually this should only be set for a single semver level (major, minor, or patch) to avoid double counting.
- `commits-per-bump` (Optional): Number of commits required for each additional bump after the first. Use `Infinity`, `"Infinity"`, or `"infinity"` to always bump once, even if breaking changes are counted as bumps. Default: `1`

Note: In JSON/JSONC files you can use `"Infinity"` or `"infinity"`; in JSON5 you can use `Infinity` directly.

#### bump... > prerelease (Optional)

Type: [`BumpRulePrerelease`](#bumpruleprerelease)  
Default: `{}`

Strategy for bumping prerelease version (1.2.3-x.x).

##### BumpRulePrerelease

Type: `object`  
**Properties:**

- `enabled` (Optional): Enable/disable handling of pre-release identifiers. Default: `false`
- `override` (Optional): Overrides pre-release identifiers to use for the next version. When provided, these values take precedence over all other bump rules. Should only be set dynamically, not in static config.
- `identifiers` (Optional): Specifies the pre-release identifiers to use when bumping a pre-release version. If not provided, keep the current existing pre-release identifiers. Type: [`SemverExtension[]`](#semverextension)

#### bump... > build (Optional)

Type: [`BumpRuleBuild`](#bumprulebuild)  
Default: `{}`

Strategy for bumping build metadata (1.2.3+x.x).

##### BumpRuleBuild

Type: `object`  
**Properties:**

- `enabled` (Optional): Enable/disable handling of build metadata. Default: `false`
- `override` (Optional): Overrides build metadata to use for the next version. When provided, these values take precedence over all other bump rules. Should only be set dynamically, not in static config.
- `metadata` (Optional): Specifies the build metadata to use when bumping a pre-release version. If not provided, keep the current existing build metadata. Type: [`SemverExtension[]`](#semverextension)

##### SemverExtension

A discriminated union based on the `type` field. Specifies the type of pre-release/build identifier/metadata.

**Type: `"static"`** — A stable label that should not change often.

- `type` (Required): `"static"`
- `value` (Required): The static string value to use. Examples: `"pre"`, `"alpha"`, `"beta"`, `"rc"`.

**Type: `"dynamic"`** — A label value that often changes per build or commit, usually sourced externally (e.g., git hash, branch name).

- `type` (Required): `"dynamic"`
- `value` (Optional): The string value to use, should be set dynamically.
- `fallback-value` (Optional): The fallback string value used when `value` is empty. If this is also empty, the identifier/metadata will be omitted from the array.

**Type: `"incremental"`** — Integer value that changes over time.

- `type` (Required): `"incremental"`
- `initial-value` (Optional): Initial integer number value. Default: `0`
- `expression-variables` (Optional): Defines custom variables for use in `next-value-expression`, `v` is reserved for current value. These variables are usually set dynamically.
- `next-value-expression` (Optional): Expression for computing the next value, where `v` represents the current value. The expression must evaluate to an integer number. Evaluated with [`expr-eval`](https://www.npmjs.com/package/expr-eval). Default: `"v+1"`
- `reset-on` (Optional): Resets the incremental value when the specified version component(s) change, could be a single or an array of options. Allowed values: `"major"`, `"minor"`, `"patch"`, `"prerelease"`, `"build"`, and `"none"`. For `"prerelease"` and `"build"`, a reset is triggered only when `"static"` values change, or when `"static"`, `"incremental"`, or `"timestamp"` values are added or removed. Any changes to `"dynamic"` values, including their addition or removal, do not trigger a reset. Default: `"none"`

**Type: `"timestamp"`** — Integer value that changes over time, representing a specific point in time since January 1, 1970 (UTC).

- `type` (Required): `"timestamp"`
- `unit` (Optional): The time unit. `"ms"` (13 digits) or `"s"` (10 digits). Default: `"ms"`

**Type: `"date"`** — A date string that changes over time.

- `type` (Required): `"date"`
- `format` (Optional): The date format. `"YYYYMMDD"` or `"YYYY-MM-DD"`. Default: `"YYYYMMDD"`
- `time-zone` (Optional): The timezone to use for the date. If not specified, falls back to base [`time-zone`](#time-zone-optional).

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
**Properties:** [`enabled`](#changelog--enabled-optional), [`command-hook`](#changelog--command-hook-optional), [`content-body-override`](#changelog--content-body-override-optional), [`path`](#changelog--path-optional), [`header-pattern`](#changelog--header-pattern-optional), [`header-pattern-path`](#changelog--header-pattern-path-optional), [`footer-pattern`](#changelog--footer-pattern-optional), [`footer-pattern-path`](#changelog--footer-pattern-path-optional), [`heading-pattern`](#changelog--heading-pattern-optional), [`body-pattern`](#changelog--body-pattern-optional), [`body-pattern-path`](#changelog--body-pattern-path-optional)

Configuration specific to changelogs. All generated changelog content are available in string pattern as `${changelogContent}` (heading + body) or `${changelogContentBody}` (body only).

#### changelog > enabled (Optional)

Type: `boolean`  
Default: `true`

Enable/disable changelog. When disabled, changelogs are still generated for pull requests, releases and string pattern but they won't be written to file.

#### changelog > command-hook (Optional)

Type: [`CommandHook`](#commandhook)

Pre/post command lists to run around the changelog operation. Each command runs from the repository root.

#### changelog > content-body-override (Optional)

Type: `string`  
Default: `""`

User-provided changelog content body, available in string pattern as `${changelogContentBody}`. If set, completely skips the built-in generation process and uses this value as the content. Should only be set dynamically, not in static config.

#### changelog > path (Optional)

Type: `string`  
Default: `"CHANGELOG.md"`

Path to the file where the generated changelog will be written to, relative to the project root.

#### changelog > header-pattern (Optional)

Type: `string`  
Default: `"# Changelog\n\n<br/>\n"`

Pattern for changelog file header. Placed above any changelog content sections.

#### changelog > header-pattern-path (Optional)

Type: `string`

Path to text file containing changelog file header. Overrides `header-pattern` when both are provided.

#### changelog > footer-pattern (Optional)

Type: `string`

Pattern for changelog file footer. Placed below any changelog content section.

#### changelog > footer-pattern-path (Optional)

Type: `string`

Path to text file containing changelog file footer. Overrides `footer-pattern` when both are provided.

#### changelog > heading-pattern (Optional)

Type: `string`  
Default: `"## ${tagName:mdLink(compare=tagPrev,prev=1)} (${YYYY-MM-DD}) <!-- time-zone: ${timeZone} -->"`

Pattern for heading of a changelog content section.

#### changelog > body-pattern (Optional)

Type: `string`  
Default: `"${changelogContentBody}"`

Pattern for body of a changelog content section.

#### changelog > body-pattern-path (Optional)

Type: `string`

Path to text file containing body of a changelog content section. Overrides `body-pattern` when both are provided.

### pull-request (Optional)

Type: `object`  
**Properties:** [`enabled`](#pull--enabled-optional), [`command-hook`](#pull--command-hook-optional), [`branch-name-pattern`](#pull--branch-name-pattern-optional), [`labels-on-create`](#pull--labels-on-create-optional), [`labels-on-close`](#pull--labels-on-close-optional), [`title-pattern`](#pull--title-pattern-optional), [`header-pattern`](#pull--header-pattern-optional), [`body-pattern`](#pull--body-pattern-optional), [`body-pattern-path`](#pull--body-pattern-path-optional), [`footer-pattern`](#pull--footer-pattern-optional)

An object containing configuration options that are specific to pull request operations. These settings will only apply when working with pull requests.

#### pull... > enabled (Optional)

Type: `boolean`  
Default: `true`

Enable/disable pull request creation. If disabled, version changes, changelog, tags, and releases will be committed and created directly.

#### pull... > command-hook (Optional)

Type: [`CommandHook`](#commandhook)

Pre/post command lists to run around the pull request operation. Each command runs from the repository root.

#### pull... > branch-name-pattern (Optional)

Type: `string`  
Default: `"release/zephyr-release"`

Pattern for branch name that Zephyr Release is gonna use.

#### pull... > labels-on-create (Optional)

Type: [`Label`](#label-object) | [`Label[]`](#label-object)  
Default: `{ name: "zp-release: pending",...}`

A label or an array of labels to add to the pull request when it is created.

#### pull... > labels-on-close (Optional)

Type: [`Label`](#label-object) | [`Label[]`](#label-object)  
Default: `{ name: "zp-release: released",...}`

A label or an array of labels to add to the pull request when it is closed and the release operation has completed.

#### pull... > title-pattern (Optional)

Type: `string`  
Default: `"chore: release v${version}"`

Pattern for pull request title.

#### pull... > header-pattern (Optional)

Type: `string | string[]`  
Default: `"🤖 New release created. Stand by for approval"`

Pattern for pull request header. If an array is provided, it will randomly choose one from it.

#### pull... > body-pattern (Optional)

Type: `string`  
Default: `"${changelogContent}"`

Pattern for pull request body.

#### pull... > body-pattern-path (Optional)

Type: `string`

Path to text file containing pull request body pattern. Overrides body pattern if both are provided.

#### pull... > footer-pattern (Optional)

Type: `string`  
Default: `"Generated with [Zephyr Release](https://github.com/Pandoriux/zephyr-release)"`

Pattern for pull request footer.

##### Label Object

Type: `object`  
**Properties:**

- `name` (Required): Label name.
- `description` (Optional): Label description. Default: `""`
- `color` (Optional): The hexadecimal color code for the label, without the leading #. Default: `"ededed"`

### release (Optional)

Type: `object`  
**Properties:** [`enabled`](#release--enabled-optional), [`skip-release`](#release--skip-release-optional), [`command-hook`](#release--command-hook-optional), [`draft`](#release--draft-optional), [`prerelease`](#release--prerelease-optional), [`tag-name-pattern`](#release--tag-name-pattern-optional), [`title-pattern`](#release--title-pattern-optional), [`body-pattern`](#release--body-pattern-optional)

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

#### release > tag-name-pattern (Optional)

Type: `string`  
Default: `"v${version}"`

Pattern for tag name, available in string pattern as `${tagName}`.

#### release > title-pattern (Optional)

Type: `string`  
Default: `"${tagName}"`

Pattern for release title.

#### release > body-pattern (Optional)

Type: `string`  
Default: `"${changelogContent}"`

Pattern for release body.

## String Patterns

Available string patterns that can be used in various configuration fields.

### User-defined

These patterns are resolved based on user configuration.

- `${name}`: Project name [[→ name](#name-optional)].
- `${timeZone}`: IANA time zone [[→ time-zone](#time-zone-optional)].

<br/>

- `${tagName}`: Tag name [[→ tag-name-pattern](#release--tag-name-pattern-optional)].

### App-defined

These patterns are resolved based on the app code.

- `${repoOwner}`: GitHub repository owner (organization or user).
- `${repoName}`: GitHub repository name.

<br/>

- `${YYYY-MM-DD}`: Full date in ISO format (e.g., `2025-10-21`).
- `${DD-MM-YYYY}`: Full date in day-first format (e.g., `21-10-2025`).
- `${YYYY}`: Four-digit year (e.g., `2025`).
- `${MM}`: Two-digit month (01–12).
- `${DD}`: Two-digit day of the month (01–31).
- `${hh:mm:ss}`: Full time in 24-hour format (e.g., `14:37:05`).
- `${hh}`: Two-digit hour in 24-hour format (00–23).
- `${mm}`: Two-digit minute (00–59).
- `${ss}`: Two-digit second (00–59).

<br/>

- `${version}`: The full semantic version (SemVer) number.
- `${versionPri}`: The primary part of the semantic version (major.minor.patch).
- `${versionPre}`: The prerelease identifier of the semantic version.
- `${versionBld}`: The build metadata of the semantic version.

<br/>

- `${changelogContent}`: The generated changelog content section (→ [heading](#changelog--heading-pattern-optional) + [body](#changelog--body-pattern-optional)).
- `${changelogContentBody}`: The generated changelog body. You can override it with your own computed content [[→ content-body-override](#changelog--content-body-override-optional)].

<br/>

- `${<key>:mdLink(compare=tagPrev,prev=<N>)}`: Wraps the resolved `${key}` as a markdown-formatted GitHub compare link from the previous tag to the current tag.  
\- `<key>` must be either a pattern name (e.g. `tagName`) or a quoted literal label (`"Release v1.0"`).  
\- `<N>` is a positive integer, default `1`.

  - **Quoted literal:** `${"Release v1.0":mdLink(compare=tagPrev,prev=1)}` uses the literal text as the link label.  
    Resolved to `[Release v1.0](https://github.com/<owner>/<repo>/compare/<previous-1-tag>...<current-tag>)`.  
  - **Unquoted (pattern):** `${tagName:mdLink(compare=tagPrev,prev=1)}` resolves `tagName` from context.  
    Resolved to `[v2.0.0](https://github.com/<owner>/<repo>/compare/<previous-1-tag>...v2.0.0)`.  
  - If a compare URL cannot be constructed:  
    \- If the pattern cannot be resolved → returns an empty string.  
    \- If the tag or repository data cannot be found → returns plain text (without Markdown link formatting) instead of a broken link.
