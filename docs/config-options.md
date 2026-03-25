# Configuration options <!-- omit from toc -->

All possible config options of the Zephyr Release Configuration file. Most options are optional - if you don't provide them, default values will be used.  
Except: [version-files](#version-files-required)

It is recommended to use [`JSON Schema (v1)`](https://raw.githubusercontent.com/Pandoriux/zephyr-release/refs/heads/main/schemas/config-v1.json) when writing the config JSON.

To know more about templates, see [string-templates-and-patterns.md](./string-templates-and-patterns.md).

Some example [config files](https://github.com/Pandoriux/zephyr-release/tree/main/docs/examples).

## Table of Content <!-- auto-generated, do not edit --> <!-- omit from toc -->

- [Properties](#properties)
  - [name (Optional)](#name-optional)
  - [time-zone (Optional)](#time-zone-optional)
  - [custom-string-patterns (Optional)](#custom-string-patterns-optional)
  - [mode (Optional)](#mode-optional)
  - [review (Optional)](#review-optional)
    - [review \> draft (Optional)](#review--draft-optional)
    - [review \> working-branch-name-template (Optional)](#review--working-branch-name-template-optional)
    - [review \> title-template (Optional)](#review--title-template-optional)
    - [review \> title-template-path (Optional)](#review--title-template-path-optional)
    - [review \> header-template (Optional)](#review--header-template-optional)
    - [review \> header-template-path (Optional)](#review--header-template-path-optional)
    - [review \> body-template (Optional)](#review--body-template-optional)
    - [review \> body-template-path (Optional)](#review--body-template-path-optional)
    - [review \> footer-template (Optional)](#review--footer-template-optional)
    - [review \> footer-template-path (Optional)](#review--footer-template-path-optional)
    - [review \> labels (Optional)](#review--labels-optional)
      - [... \> labels \> on-create (Optional)](#--labels--on-create-optional)
        - [... \> on-create \> name (Required)](#--on-create--name-required)
        - [... \> on-create \> description (Optional)](#--on-create--description-optional)
        - [... \> on-create \> color (Optional)](#--on-create--color-optional)
        - [... \> on-create \> create-if-missing (Optional)](#--on-create--create-if-missing-optional)
      - [... \> labels \> on-close (Optional)](#--labels--on-close-optional)
        - [... \> on-close \> add (Optional)](#--on-close--add-optional)
        - [... \> add \> same properties as `review > labels > on-create`](#--add--same-properties-as-review--labels--on-create)
        - [... \> on-close \> remove (Optional)](#--on-close--remove-optional)
        - [... \> remove \> same properties as `review > labels > on-create`](#--remove--same-properties-as-review--labels--on-create)
    - [review \> assignees (Optional)](#review--assignees-optional)
    - [review \> reviewers (Optional)](#review--reviewers-optional)
  - [auto (Optional)](#auto-optional)
    - [auto \> trigger-strategy (Optional)](#auto--trigger-strategy-optional)
      - [... \> trigger-strategy \> type (Required)](#--trigger-strategy--type-required)
  - [command-hooks (Optional)](#command-hooks-optional)
    - [command-hooks \> base (Optional)](#command-hooks--base-optional)
      - [... \> base \> timeout (Optional)](#--base--timeout-optional)
      - [... \> base \> continue-on-error (Optional)](#--base--continue-on-error-optional)
      - [... \> base \> pre (Optional)](#--base--pre-optional)
        - [... \> pre \> cmd (Required)](#--pre--cmd-required)
        - [... \> pre \> timeout (Optional)](#--pre--timeout-optional)
        - [... \> pre \> continue-on-error (Optional)](#--pre--continue-on-error-optional)
      - [... \> base \> post (Optional)](#--base--post-optional)
        - [... \> post \> same properties as `command-hooks > base > pre`](#--post--same-properties-as-command-hooks--base--pre)
    - [command-hooks \> prepare (Optional)](#command-hooks--prepare-optional)
      - [... \> prepare \> same properties as `command-hooks > base`](#--prepare--same-properties-as-command-hooks--base)
    - [command-hooks \> publish (Optional)](#command-hooks--publish-optional)
      - [... \> publish \> same properties as `command-hooks > base`](#--publish--same-properties-as-command-hooks--base)
  - [runtime-config-override (Optional)](#runtime-config-override-optional)
    - [runtime-config-override \> path (Required)](#runtime-config-override--path-required)
    - [runtime-config-override \> format (Optional)](#runtime-config-override--format-optional)
  - [initial-version (Optional)](#initial-version-optional)
  - [version-files (Required)](#version-files-required)
    - [version-files \> path (Required)](#version-files--path-required)
    - [version-files \> format (Optional)](#version-files--format-optional)
    - [version-files \> extractor (Optional)](#version-files--extractor-optional)
    - [version-files \> selector (Required)](#version-files--selector-required)
    - [version-files \> primary (Optional)](#version-files--primary-optional)
  - [commit-types (Optional)](#commit-types-optional)
    - [commit-types \> type (Required)](#commit-types--type-required)
    - [commit-types \> section (Optional)](#commit-types--section-optional)
    - [commit-types \> hidden (Optional)](#commit-types--hidden-optional)
  - [stop-resolving-commit-at (Optional)](#stop-resolving-commit-at-optional)
  - [allowed-release-as-commit-types (Optional)](#allowed-release-as-commit-types-optional)
  - [bump-strategy (Optional)](#bump-strategy-optional)
    - [bump-strategy \> major (Optional)](#bump-strategy--major-optional)
      - [... \> major \> types (Optional)](#--major--types-optional)
      - [... \> major \> count-breaking-as (Optional)](#--major--count-breaking-as-optional)
      - [... \> major \> commits-per-bump (Optional)](#--major--commits-per-bump-optional)
    - [bump-strategy \> minor (Optional)](#bump-strategy--minor-optional)
      - [... \> minor \> same properties as `bump-strategy > major`](#--minor--same-properties-as-bump-strategy--major)
    - [bump-strategy \> patch (Optional)](#bump-strategy--patch-optional)
      - [... \> patch \> same properties as `bump-strategy > major`](#--patch--same-properties-as-bump-strategy--major)
    - [bump-strategy \> prerelease (Optional)](#bump-strategy--prerelease-optional)
      - [... \> prerelease \> enabled (Optional)](#--prerelease--enabled-optional)
      - [... \> prerelease \> override (Optional)](#--prerelease--override-optional)
      - [... \> prerelease \> treat-override-as-significant (Optional)](#--prerelease--treat-override-as-significant-optional)
      - [... \> prerelease \> extensions (Optional)](#--prerelease--extensions-optional)
        - [... \> extensions \> type (Required)](#--extensions--type-required)
    - [bump-strategy \> build (Optional)](#bump-strategy--build-optional)
      - [... \> build \> same properties as `bump-strategy > prerelease`](#--build--same-properties-as-bump-strategy--prerelease)
    - [bump-strategy \> bump-minor-for-major-pre-stable (Optional)](#bump-strategy--bump-minor-for-major-pre-stable-optional)
    - [bump-strategy \> bump-patch-for-minor-pre-stable (Optional)](#bump-strategy--bump-patch-for-minor-pre-stable-optional)
  - [changelog (Optional)](#changelog-optional)
    - [changelog \> write-to-file (Optional)](#changelog--write-to-file-optional)
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
  - [commit (Optional)](#commit-optional)
    - [commit \> header-template (Optional)](#commit--header-template-optional)
    - [commit \> header-template-path (Optional)](#commit--header-template-path-optional)
    - [commit \> body-template (Optional)](#commit--body-template-optional)
    - [commit \> body-template-path (Optional)](#commit--body-template-path-optional)
    - [commit \> footer-template (Optional)](#commit--footer-template-optional)
    - [commit \> footer-template-path (Optional)](#commit--footer-template-path-optional)
    - [commit \> local-files-to-commit (Optional)](#commit--local-files-to-commit-optional)
  - [tag (Optional)](#tag-optional)
    - [tag \> create-tag (Optional)](#tag--create-tag-optional)
    - [tag \> name-template (Optional)](#tag--name-template-optional)
    - [tag \> type (Optional)](#tag--type-optional)
    - [tag \> message-template (Optional)](#tag--message-template-optional)
    - [tag \> message-template-path (Optional)](#tag--message-template-path-optional)
    - [tag \> tagger (Optional)](#tag--tagger-optional)
      - [... \> tagger \> name (Required)](#--tagger--name-required)
      - [... \> tagger \> email (Required)](#--tagger--email-required)
      - [... \> tagger \> date (Optional)](#--tagger--date-optional)
  - [release (Optional)](#release-optional)
    - [release \> create-release (Optional)](#release--create-release-optional)
    - [release \> prerelease (Optional)](#release--prerelease-optional)
    - [release \> draft (Optional)](#release--draft-optional)
    - [release \> set-latest (Optional)](#release--set-latest-optional)
    - [release \> title-template (Optional)](#release--title-template-optional)
    - [release \> title-template-path (Optional)](#release--title-template-path-optional)
    - [release \> body-template (Optional)](#release--body-template-optional)
    - [release \> body-template-path (Optional)](#release--body-template-path-optional)
    - [release \> assets (Optional)](#release--assets-optional)
- [Type Definitions](#type-definitions)
  - [AutoStrategy](#autostrategy)
  - [SemverExtension](#semverextension)
  
## Properties

### name (Optional)

Type: `string`  
Default: `""`

The project name used in [string templates](./string-templates-and-patterns.md) (available as `{{ name }}`).

### time-zone (Optional)

Type: `string`  
Default: `"UTC"`

IANA time zone used to format and display times.  
This value is also available for use in [string templates](./string-templates-and-patterns.md) as `{{ timeZone }}`.

### custom-string-patterns (Optional)

Type: `object` (record of string to string)

Custom string patterns to use in templates. The key is the pattern name, available as `{{ <key> }}` in [string templates](./string-templates-and-patterns.md), while the resolved value is the key's value.

**Notes:** If a custom pattern key name matches an existing built-in pattern name, the built-in pattern takes precedence and the custom value will be ignored.

### mode (Optional)

Type: `"review" | "auto"`  
Default: `"review"`

Defines the execution strategy.

- **`"review"`**: Routes updates through a release proposal (PR, MR, ...). This is the default behavior where Zephyr Release creates or updates a proposal with version bumps and changelog changes.
- **`"auto"`**: Bypasses the proposal and commits directly to the branch. When set to `"auto"`, the release operation will commit changes directly to the branch without creating a proposal (PR, MR, ...).

If choosing `"auto"`, see [`auto > trigger-strategy`](#auto--trigger-strategy-optional) for configuring when automated releases are triggered.

### review (Optional)

Type: `object`  
**Properties:** [`draft`](#review--draft-optional), [`working-branch-name-template`](#review--working-branch-name-template-optional), [`title-template`](#review--title-template-optional), [`title-template-path`](#review--title-template-path-optional), [`header-template`](#review--header-template-optional), [`header-template-path`](#review--header-template-path-optional), [`body-template`](#review--body-template-optional), [`body-template-path`](#review--body-template-path-optional), [`footer-template`](#review--footer-template-optional), [`footer-template-path`](#review--footer-template-path-optional), [`labels`](#review--labels-optional), [`assignees`](#review--assignees-optional), [`reviewers`](#review--reviewers-optional)

Configuration specific to the `"review"` execution `mode`. Defines how release proposals (such as PRs, MRs, ...) are generated, formatted, and tracked.

#### review > draft (Optional)

Type: `boolean`  
Default: `false`

If enabled, the proposal will be created as draft.

#### review > working-branch-name-template (Optional)

Type: `string`  
Default: [`DEFAULT_WORKING_BRANCH_NAME_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for branch name that Zephyr Release will use.  
Allowed patterns to use are: fixed base string patterns.

#### review > title-template (Optional)

Type: `string`  
Default: [`DEFAULT_PROPOSAL_TITLE_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for proposal title, using with string patterns like {{ version }}.  
Allowed patterns to use are: all fixed and dynamic string patterns.

#### review > title-template-path (Optional)

Type: `string`

Path to text file containing proposal title template. Overrides `title-template` when both are provided.  
To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### review > header-template (Optional)

Type: `string`  
Default: [`DEFAULT_PROPOSAL_HEADER_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for proposal header, using with string patterns like {{ version }}.  
Allowed patterns to use are: all fixed and dynamic string patterns.

#### review > header-template-path (Optional)

Type: `string`

Path to text file containing proposal header template. Overrides `header-template` when both are provided.  
To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### review > body-template (Optional)

Type: `string`  
Default: [`DEFAULT_PROPOSAL_BODY_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for proposal body, using with string patterns like {{ changelogRelease }}.  
Allowed patterns to use are: all fixed and dynamic string patterns.

#### review > body-template-path (Optional)

Type: `string`

Path to text file containing proposal body template. Overrides `body-template` when both are provided.  
To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### review > footer-template (Optional)

Type: `string`  
Default: [`DEFAULT_PROPOSAL_FOOTER_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for proposal footer, using with string patterns.  
Allowed patterns to use are: all fixed and dynamic string patterns.

#### review > footer-template-path (Optional)

Type: `string`

Path to text file containing proposal footer template. Overrides `footer-template` when both are provided.  
To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### review > labels (Optional)

Type: `object`  
Default: `{}`

Labels to attach and remove from proposals on different stages.

##### ... > labels > on-create (Optional)

Type: `string | object | (string | object)[]`

Labels to attach to proposals when created. Can be a string, a label object, or an array containing either.

###### ... > on-create > name (Required)

Type: `string`

Label name.

###### ... > on-create > description (Optional)

Type: `string`

Label description.

###### ... > on-create > color (Optional)

Type: `string`  
Default: `"#ededed"`

The hexadecimal color code for the label, in standard format with the leading #.

###### ... > on-create > create-if-missing (Optional)

Type: `boolean`  
Default: `false`

If enabled, the label will be created if it does not exist on the platform.

##### ... > labels > on-close (Optional)

Type: `object`

Labels to attach and remove from proposals when closed and release operation has completed.

###### ... > on-close > add (Optional)

Type: `string | object | (string | object)[]`

Labels to add when proposal is closed.

###### ... > add > same properties as `review > labels > on-create`

Same as [`review > labels > on-create`](#--labels--on-create-optional).

- [`name`](#--on-create--name-required)
- [`description`](#--on-create--description-optional)
- [`color`](#--on-create--color-optional)
- [`create-if-missing`](#--on-create--create-if-missing-optional)

###### ... > on-close > remove (Optional)

Type: `string | object | (string | object)[]`

Labels to remove when proposal is closed. Use `"<ALL_ON_CREATE>"` to remove all labels added in `on-create`.

###### ... > remove > same properties as `review > labels > on-create`

Same as [`review > labels > on-create`](#--labels--on-create-optional).

- [`name`](#--on-create--name-required)
- [`description`](#--on-create--description-optional)
- [`color`](#--on-create--color-optional)
- [`create-if-missing`](#--on-create--create-if-missing-optional)

#### review > assignees (Optional)

Type: `string | string[]`

A list of user identifiers to assign to the release proposal.  
Use the platform's expected format (e.g., usernames).

#### review > reviewers (Optional)

Type: `string | string[]`

A list of user or team identifiers requested to review the release proposal.  
Use the platform's expected format (e.g., usernames or team slugs).

### auto (Optional)

Type: `object`  

Configuration specific to the `"auto"` execution `mode`. Defines the conditions and strategies for bypassing proposals and committing releases directly.

#### auto > trigger-strategy (Optional)

Type: [`AutoStrategy`](#autostrategy)  
Default: `{ type: "commit-types" }`

Strategy that determines whether an automated release should be triggered when base [`mode`](#mode-optional) is set to `"auto"`.  
Defines the conditions under which a release will be automatically triggered and committed directly to the branch.

##### ... > trigger-strategy > type (Required)

Type: `"commit-types" | "commit-footer" | "flag"`

The strategy type used for automated releases. See [`AutoStrategy`](#autostrategy) for full configuration details of each type.

### command-hooks (Optional)

Type: `object`  
**Properties:** [`base`](#command-hooks--base-optional), [`prepare`](#command-hooks--prepare-optional), [`publish`](#command-hooks--publish-optional)

Command hooks to run at different phases of the operation. Each command runs from the repository root.

#### command-hooks > base (Optional)

Type: `object`

Pre/post commands to run around the main operation. Each command runs from the repository root.  
Post commands will always run regardless of operation outcome (success, skipped or failure). It is recommended to check the outcome export variable if your script should only run under specific conditions.  
Available variables that cmds can use: see [Export operation variables](./export-variables.md).

##### ... > base > timeout (Optional)

Type: `number | string`  
Default: `60000` (1 min)

Base default timeout (ms) for all commands in `pre` and `post`, can be overridden per command. Use `Infinity`, `"Infinity"`, or `"infinity"` to never timeout (not recommended).

##### ... > base > continue-on-error (Optional)

Type: `boolean`  
Default: `false`

Base default behavior for all commands in `pre` and `post`, can be overridden per command.

##### ... > base > pre (Optional)

Type: `(string | object)[]`

Commands to run before the operation.  
Each command can be either a `string` or an `object`.  
List of exposed env variables: see [Export operation variables](./export-variables.md).

###### ... > pre > cmd (Required)

Type: `string`

The command string to execute.

###### ... > pre > timeout (Optional)

Type: `number | string`  
Default: Base default timeout

Timeout in milliseconds, use Infinity to never timeout (not recommended).

###### ... > pre > continue-on-error (Optional)

Type: `boolean`  
Default: Base default continue-on-error

Continue or stop the process on commands error.

##### ... > base > post (Optional)

Type: `(string | object)[]`

Commands to run after the operation.  
Each command can be either a `string` or an `object`.  
List of exposed env variables: see [Export operation variables](./export-variables.md).

###### ... > post > same properties as `command-hooks > base > pre`

Same as [`command-hooks > base > pre`](#--base--pre-optional).

- [`cmd`](#--pre--cmd-required)
- [`timeout`](#--pre--timeout-optional)
- [`continue-on-error`](#--pre--continue-on-error-optional)

#### command-hooks > prepare (Optional)

Type: `object`

Pre/post commands to run around the proposal (PR, MR, ...) operation. Each command runs from the repository root.  
Available variables that cmds can use: see [Export operation variables](./export-variables.md).

##### ... > prepare > same properties as `command-hooks > base`

Same as [`command-hooks > base`](#command-hooks--base-optional).

- [`timeout`](#--base--timeout-optional)
- [`continue-on-error`](#--base--continue-on-error-optional)
- [`pre`](#--base--pre-optional)
- [`post`](#--base--post-optional)

#### command-hooks > publish (Optional)

Type: `object`

Pre/post commands to run around the release operation. Each command runs from the repository root.  
Available variables that cmds can use: see [Export operation variables](./export-variables.md).

##### ... > publish > same properties as `command-hooks > base`

Same as [`command-hooks > base`](#command-hooks--base-optional).

- [`timeout`](#--base--timeout-optional)
- [`continue-on-error`](#--base--continue-on-error-optional)
- [`pre`](#--base--pre-optional)
- [`post`](#--base--post-optional)

### runtime-config-override (Optional)

Type: `object`  
**Properties:** [`path`](#runtime-config-override--path-required), [`format`](#runtime-config-override--format-optional)

A dynamic configuration file to deep-merge over the resolved config at runtime, typically generated by a [`command-hooks`](#command-hooks-optional) script.

This file is always read from the local filesystem. If the file does not exist or is empty, it is safely ignored. However, if the file exists but the merged result fails schema validation, the operation will throw an error.

#### runtime-config-override > path (Required)

Type: `string`

Path to the runtime override config file, read from the local filesystem.

#### runtime-config-override > format (Optional)

Type: `string`  
Default: `"auto"`

Config file format. Allowed values: `auto`, `json`, `jsonc`, `json5`, `yaml`, `toml`.

### initial-version (Optional)

Type: `string`  
Default: `"0.1.0"`

The initial semantic version used when a project has no existing version defined in its main version file (for example, `version.txt`, `package.json`, `deno.json`, `cargo.toml`, etc.).

This value serves as the starting version when the version field is missing, undefined, or empty - typically during the first setup or initialization of a project.

Once a version is established, subsequent releases will increment from the current value rather than this initial one.

### version-files (Required)

Type: `object | object[]`

Version file(s). Accepts a single file object or an array of file objects. If a single object, it becomes the primary file. If arrays, the first file with `primary: true` becomes the primary; if none are marked, the first file in the array will be.

The **primary file** serves as the main source of truth for the project's version.  
When reading or bumping versions, the action uses the primary file's version to determine the current and next version.  
Other version files (if any) are then synchronized to match the primary version.

#### version-files > path (Required)

Type: `string`

Path to the version file, relative to the project root. To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### version-files > format (Optional)

Type: `"auto" | "json" | "jsonc" | "json5" | "yaml" | "toml" | "txt"`  
Default: `"auto"`

Defines the file format.

#### version-files > extractor (Optional)

Type: `"auto" | "json-path" | "regex"`  
Default: `"auto"`

Defines how the version should be located inside the parsed output.

#### version-files > selector (Required)

Type: `string`

The lookup used by the chosen extractor. For `json-path`, this is the JSON path string; for `regex`, supply the pattern.

#### version-files > primary (Optional)

Type: `boolean`  
Default: `false`

Marks this file as the primary source of truth for the current version.

### commit-types (Optional)

Type: `array of objects`  
Default: `{ type: "feat", section: "Features" }, { type: "fix", section: "Bug Fixes" }, { type: "perf", section: "Performance Improvements" }, { type: "revert", section: "Reverts" }`

**Properties:** [`type`](#commit-types--type-required), [`section`](#commit-types--section-optional), [`hidden`](#commit-types--hidden-optional)

List of commit types that the application will track and record. Only commits with these types will be considered when calculating version bumps and generating release notes.

#### commit-types > type (Required)

Type: `string`

Commit type name (e.g., "feat", "fix").

#### commit-types > section (Optional)

Type: `string`

Changelog section heading for this commit type. When empty, the `type` value is used.

#### commit-types > hidden (Optional)

Type: `boolean`  
Default: `false`

Exclude this commit type from changelog generation (does not affect version bump calculation).

### stop-resolving-commit-at (Optional)

Type: `number | string`

Defines the boundary for resolving Git commit history. Can be a number or a string.

- **Number**: The maximum amount of commits to resolve (e.g., `50`).
- **String**: The specific Git commit hash to stop at (e.g., `"abc123def456"`).

### allowed-release-as-commit-types (Optional)

Type: `string | string[]`  
Default: `"<ALL>"`

List of commit type(s) allowed to trigger `release-as`. Accepts a single string or an array of strings.

**Special values:**

- `"<ALL>"`: Accepts any commit type (default behavior)
- `"<COMMIT_TYPES>"`: Uses the list of commit types defined in [`commit-types`](#commit-types-optional)

You can combine `"<COMMIT_TYPES>"` with other commit types. For example: `["<COMMIT_TYPES>", "chore", "ci", "cd"]` will allow commits with types from `commit-types` plus `"chore"`, `"ci"`, and `"cd"`.

About `release-as`: <https://github.com/Pandoriux/zephyr-release?tab=readme-ov-file#force-a-specific-version>

### bump-strategy (Optional)

Type: `object`  
**Properties:** [`major`](#bump-strategy--major-optional), [`minor`](#bump-strategy--minor-optional), [`patch`](#bump-strategy--patch-optional), [`prerelease`](#bump-strategy--prerelease-optional), [`build`](#bump-strategy--build-optional), [`bump-minor-for-major-pre-stable`](#bump-strategy--bump-minor-for-major-pre-stable-optional), [`bump-patch-for-minor-pre-stable`](#bump-strategy--bump-patch-for-minor-pre-stable-optional)

Configuration options that determine how version numbers are calculated.

#### bump-strategy > major (Optional)

Type: `object`  
Default: `{ count-breaking-as: "bump" }`

Strategy for major version bumps (x.0.0).

##### ... > major > types (Optional)

Type: `string[]`

Array of commit types (from base [`commit-types`](#commit-types-optional)) that count toward version bumping.

##### ... > major > count-breaking-as (Optional)

Type: `"none" | "commit" | "bump"`  
Default: `"none"`

How to treat breaking changes regardless of `types`.  
Usually this should only be set for a single semver level (major, minor, or patch) to avoid double counting.

##### ... > major > commits-per-bump (Optional)

Type: `number | string`  
Default: `Infinity`

Number of commits required for each additional bump after the first. Use `Infinity`, `"Infinity"`, or `"infinity"` to always bump once, even if breaking changes are counted as bumps.

Note: In JSON/JSONC files you can use `"Infinity"` or `"infinity"`; in JSON5 you can use `Infinity` directly.

#### bump-strategy > minor (Optional)

Type: `object`  
Default: `{ types: ["feat"] }`

Strategy for minor version bumps (0.x.0).

##### ... > minor > same properties as `bump-strategy > major`

Same as [`bump-strategy > major`](#bump-strategy--major-optional).

- [`types`](#--major--types-optional)
- [`count-breaking-as`](#--major--count-breaking-as-optional)
- [`commits-per-bump`](#--major--commits-per-bump-optional)

#### bump-strategy > patch (Optional)

Type: `object`  
Default: `{ types: ["fix", "perf"] }`

Strategy for patch version bumps (0.0.x).

##### ... > patch > same properties as `bump-strategy > major`

Same as [`bump-strategy > major`](#bump-strategy--major-optional).

- [`types`](#--major--types-optional)
- [`count-breaking-as`](#--major--count-breaking-as-optional)
- [`commits-per-bump`](#--major--commits-per-bump-optional)

#### bump-strategy > prerelease (Optional)

Type: `object`  
Default: `{}`

Strategy for bumping prerelease version (1.2.3-x.x).

##### ... > prerelease > enabled (Optional)

Type: `boolean`  
Default: `false`

Enable/disable handling of SemVer extensions (pre-release identifiers / build metadata).

##### ... > prerelease > override (Optional)

Type: `any[]`

Overrides extension items to use for the next version. When provided, these values take precedence over all other bump rules in `extensions`. Should only be set dynamically, not in static config.

##### ... > prerelease > treat-override-as-significant (Optional)

Type: `boolean`  
Default: `false`

If set to `true`, the presence of an `override` is strictly treated as a structural change. This immediately triggers resets on any dependent version components (e.g., resetting the Build number). If `false`, overrides are treated as volatile/dynamic and ignored by reset logic.

##### ... > prerelease > extensions (Optional)

Type: [`SemverExtension[]`](#semverextension)

Specifies the items to use for SemVer extensions.

###### ... > extensions > type (Required)

Type: `"static" | "dynamic" | "incremental" | "timestamp" | "date"`

The extension type. See [`SemverExtension`](#semverextension) for full configuration details of each type.

#### bump-strategy > build (Optional)

Type: `object`  
Default: `{}`

Strategy for bumping build metadata (1.2.3+x.x).

##### ... > build > same properties as `bump-strategy > prerelease`

Same as [`bump-strategy > prerelease`](#bump-strategy--prerelease-optional).

- [`enabled`](#--prerelease--enabled-optional)
- [`override`](#--prerelease--override-optional)
- [`treat-override-as-significant`](#--prerelease--treat-override-as-significant-optional)
- [`extensions`](#--prerelease--extensions-optional)

#### bump-strategy > bump-minor-for-major-pre-stable (Optional)

Type: `boolean`  
Default: `true`

Redirects major version bumps to minor in pre-1.0 (0.x.x).

#### bump-strategy > bump-patch-for-minor-pre-stable (Optional)

Type: `boolean`  
Default: `false`

Redirects minor version bumps to patch in pre-1.0 (0.x.x).

### changelog (Optional)

Type: `object`  
**Properties:** [`write-to-file`](#changelog--write-to-file-optional), [`path`](#changelog--path-optional), [`file-header-template`](#changelog--file-header-template-optional), [`file-header-template-path`](#changelog--file-header-template-path-optional), [`file-footer-template`](#changelog--file-footer-template-optional), [`file-footer-template-path`](#changelog--file-footer-template-path-optional), [`release-header-template`](#changelog--release-header-template-optional), [`release-header-template-path`](#changelog--release-header-template-path-optional), [`release-section-entry-template`](#changelog--release-section-entry-template-optional), [`release-section-entry-template-path`](#changelog--release-section-entry-template-path-optional), [`release-breaking-section-heading`](#changelog--release-breaking-section-heading-optional), [`release-breaking-section-entry-template`](#changelog--release-breaking-section-entry-template-optional), [`release-breaking-section-entry-template-path`](#changelog--release-breaking-section-entry-template-path-optional), [`release-footer-template`](#changelog--release-footer-template-optional), [`release-footer-template-path`](#changelog--release-footer-template-path-optional), [`release-body-override`](#changelog--release-body-override-optional), [`release-body-override-path`](#changelog--release-body-override-path-optional)

Configuration specific to changelogs. All generated changelog content are available in string templates as `{{ changelogRelease }}` (release header + body) or `{{ changelogReleaseHeader }}` and `{{ changelogReleaseBody }}`.

#### changelog > write-to-file (Optional)

Type: `boolean`  
Default: `true`

Enable/disable writing changelog to file. When disabled, changelogs are still generated for proposals, releases and [string templates](./string-templates-and-patterns.md) but they won't be written to file.

#### changelog > path (Optional)

Type: `string`  
Default: `"CHANGELOG.md"`

Path to the file where the generated changelog will be written to, relative to the project root.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### changelog > file-header-template (Optional)

Type: `string`  
Default: [`DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for changelog file header, using with string patterns like `{{ version }}`. Placed above any changelog content.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### changelog > file-header-template-path (Optional)

Type: `string`

Path to text file containing changelog file header. Overrides `file-header-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### changelog > file-footer-template (Optional)

Type: `string`

String template for changelog file footer, using with string patterns like `{{ version }}`. Placed below any changelog content.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### changelog > file-footer-template-path (Optional)

Type: `string`

Path to text file containing changelog file footer. Overrides `file-footer-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### changelog > release-header-template (Optional)

Type: `string`  
Default: `"## {{ tagName | md_link_compare_tag_from_current_to_latest }} ({{- YYYY }}-{{ MM }}-{{ DD }}) <!-- time-zone: {{ timeZone }} -->"`

String template for header of a changelog release, using with string patterns like `{{ version }}`.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### changelog > release-header-template-path (Optional)

Type: `string`

Path to text file containing changelog release header. Overrides `release-header-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### changelog > release-section-entry-template (Optional)

Type: `string`  
Default: [`DEFAULT_CHANGELOG_SECTION_ENTRY_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for each entries in the changelog release sections, using with fixed base and version string patterns.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns) and [dynamic patterns](./string-templates-and-patterns.md#dynamic-string-patterns).  
Additionally, you can use a special set of [dynamic patterns](./string-templates-and-patterns.md#dynamic-string-patterns) which are:

- `{{ commit }}`: The full parsed and resolved commit object. See [ResolvedCommit](../src/tasks/commit.ts#L34-L41) for the structure
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

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### changelog > release-breaking-section-heading (Optional)

Type: `string`  
Default: `"⚠ BREAKING CHANGES"`

Heading of a changelog release BREAKING section.

#### changelog > release-breaking-section-entry-template (Optional)

Type: `string`

Basically the same as `release-section-entry-template`, but for breaking changes specifically. If not provided, falls back to `release-section-entry-template`.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns) and [dynamic patterns](./string-templates-and-patterns.md#dynamic-string-patterns).

#### changelog > release-breaking-section-entry-template-path (Optional)

Type: `string`

Path to text file containing changelog release breaking section entry template. Overrides `release-breaking-section-entry-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### changelog > release-footer-template (Optional)

Type: `string`

String template for footer of a changelog release, using with string patterns.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### changelog > release-footer-template-path (Optional)

Type: `string`

Path to text file containing changelog release footer. Overrides `release-footer-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### changelog > release-body-override (Optional)

Type: `string`

User-provided changelog release body, available in string templates as `{{ changelogReleaseBody }}`. If set, completely ignores the built-in generation and uses this value as the content. Should only be set dynamically, not in static config.

#### changelog > release-body-override-path (Optional)

Type: `string`

Path to text file containing changelog release body override, will take precedence over `release-body-override`.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

### commit (Optional)

Type: `object`  
**Properties:** [`header-template`](#commit--header-template-optional), [`header-template-path`](#commit--header-template-path-optional), [`body-template`](#commit--body-template-optional), [`body-template-path`](#commit--body-template-path-optional), [`footer-template`](#commit--footer-template-optional), [`footer-template-path`](#commit--footer-template-path-optional), [`local-files-to-commit`](#commit--local-files-to-commit-optional)

Configuration specific to commits. These templates are used to build the commit message when Zephyr Release creates a commit.

#### commit > header-template (Optional)

Type: `string`  
Default: [`DEFAULT_COMMIT_HEADER_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for commit header, using with string patterns like `{{ version }}`. You can optionally include a CI skip token here (or body/footer) to prevent downstream pipeline runs (e.g., `[skip ci]` or `[ci skip]` for GitHub, GitLab, and Bitbucket).  
Allowed patterns to use are: [all fixed and dynamic string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### commit > header-template-path (Optional)

Type: `string`

Path to text file containing commit header template. Overrides `header-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### commit > body-template (Optional)

Type: `string`

String template for commit body, using with string patterns like `{{ changelogRelease }}`. You can optionally include a CI skip token here (or header/footer) to prevent downstream pipeline runs (e.g., `[skip ci]` or `[ci skip]` for GitHub, GitLab, and Bitbucket).  
Allowed patterns to use are: [all fixed and dynamic string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### commit > body-template-path (Optional)

Type: `string`

Path to text file containing commit body template. Overrides `body-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### commit > footer-template (Optional)

Type: `string`

String template for commit footer, using with string patterns. You can optionally include a CI skip token here (or header/body) to prevent downstream pipeline runs (e.g., `[skip ci]` or `[ci skip]` for GitHub, GitLab, and Bitbucket).  
Allowed patterns to use are: [all fixed and dynamic string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### commit > footer-template-path (Optional)

Type: `string`

Path to text file containing commit footer template. Overrides `footer-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### commit > local-files-to-commit (Optional)

Type: `string | string[]`

Additional changed local files to include in the commit. Accepts a path or an array of paths/globs. Paths are relative to the repo root.

To include all changed files, you can use a glob pattern such as `"**/*"`.

### tag (Optional)

Type: `object`  
**Properties:** [`create-tag`](#tag--create-tag-optional), [`name-template`](#tag--name-template-optional), [`type`](#tag--type-optional), [`message-template`](#tag--message-template-optional), [`message-template-path`](#tag--message-template-path-optional), [`tagger`](#tag--tagger-optional)

Configuration specific to tags.

#### tag > create-tag (Optional)

Type: `boolean`  
Default: `true`

Enable/disable tag creation. If disabled, create release note will also be skipped.

#### tag > name-template (Optional)

Type: `string`  
Default: [`DEFAULT_TAG_NAME_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for tag name, using with string patterns like `{{ version }}`. Available in [string templates](./string-templates-and-patterns.md) as `{{ tagName }}`.  
Allowed patterns to use in template are: [fixed base](./string-templates-and-patterns.md#base) and [fixed version](./string-templates-and-patterns.md#version) string patterns and [dynamic patterns](./string-templates-and-patterns.md#dynamic-string-patterns).

#### tag > type (Optional)

Type: `"annotated" | "lightweight"`  
Default: `"annotated"`

The type of Git tag to create, either annotated or lightweight. If annotated, a tag message is required.

#### tag > message-template (Optional)

Type: `string`  
Default: [`DEFAULT_TAG_MESSAGE_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for the Git annotated tag message.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### tag > message-template-path (Optional)

Type: `string`

Path to text file containing Git annotated tag message template. Overrides `message-template` when both are provided.
To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### tag > tagger (Optional)

Type: `object`

Custom identity and timestamp information for the Git tag. If omitted, defaults to the platform native behavior.

##### ... > tagger > name (Required)

Type: `string`

The name of the tag creator.

##### ... > tagger > email (Required)

Type: `string`

The email of the tag creator.

##### ... > tagger > date (Optional)

Type: `string`

Override the Git tag timestamp.  
Can be one of these options:

- `"now"`: The moment the operation creates the tag.
- `"commit-date"`: The Git committer date.
- `"author-date"`: The Git author date.
- Or a specific ISO 8601 date string.  
If omitted, defaults to the platform native behavior (recommended).

### release (Optional)

Type: `object`  
**Properties:** [`create-release`](#release--create-release-optional), [`prerelease`](#release--prerelease-optional), [`draft`](#release--draft-optional), [`set-latest`](#release--set-latest-optional), [`title-template`](#release--title-template-optional), [`title-template-path`](#release--title-template-path-optional), [`body-template`](#release--body-template-optional), [`body-template-path`](#release--body-template-path-optional), [`assets`](#release--assets-optional)

Configuration specific to releases.

#### release > create-release (Optional)

Type: `boolean`  
Default: `true`

Enable/disable release creation.

#### release > prerelease (Optional)

Type: `boolean`  
Default: `false`

If enabled, the release will be marked as prerelease.

#### release > draft (Optional)

Type: `boolean`  
Default: `false`

If enabled, the release will be created as draft.

#### release > set-latest (Optional)

Type: `boolean`  
Default: `true`

If enabled, the release will be set as the latest release.

#### release > title-template (Optional)

Type: `string`  
Default: [`DEFAULT_RELEASE_TITLE_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for release note title, using with string patterns like `{{ tagName }}`.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### release > title-template-path (Optional)

Type: `string`

Path to text file containing release title template. Overrides `title-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### release > body-template (Optional)

Type: `string`  
Default: [`DEFAULT_RELEASE_BODY_TEMPLATE`](../src/constants/defaults/string-templates.ts)

String template for release note body, using with string patterns like `{{ changelogRelease }}`.  
Allowed patterns to use are: [all string patterns](./string-templates-and-patterns.md#available-string-patterns).

#### release > body-template-path (Optional)

Type: `string`

Path to text file containing release body template. Overrides `body-template` when both are provided.

To customize whether this file is fetched locally or remotely, see [source mode](./input-options.md#source-mode-optional).

#### release > assets (Optional)

Type: `string | string[]`

List of local asset path(s) to attach to the release. Accepts a single string or an array of strings. Paths are relative to the repository root.

## Type Definitions

### AutoStrategy

A discriminated union based on the `type` field. Defines the strategy for automatically triggering releases when [`mode`](#mode-optional) is set to `"auto"`.

**Type: `"commit-types"`** - Triggers a release automatically when the pushed commits contain specific allowed types.

- `type` (Required): `"commit-types"`
- `allowed-types` (Optional): Allowed commit types (a string or array of strings) that can trigger a release, must be chosen from the base [`commit-types`](#commit-types-optional). If omitted, all types in the base `commit-types` are allowed.
- `min-commit-count` (Optional): The minimum number of unreleased matching commits required to trigger a release. Accepts a single number for a global count, or an object mapping specific commit types to their own minimum counts. When using object, thresholds are evaluated using OR logic, the release triggers if ANY of the specified counts are met. Default: `1`
- `require-breaking` (Optional): If set to `true`, an auto-release will ONLY trigger if at least one of the matching commits contains a breaking change. Default: `false`

**Type: `"commit-footer"`** - Triggers a release automatically when a specific token is found in the commit footers.

- `type` (Required): `"commit-footer"`
- `token` (Required): The conventional commit footer token to look for (e.g., `"Autorelease"`).
- `value` (Optional): The specific value the footer token must have (e.g., `"true"`). If omitted, only the token's presence is required.

**Type: `"flag"`** - Triggers a release based on a strict boolean flag. Ideal for dynamic configuration overrides and custom script evaluations. The strategy will be evaluated after the cmd hooks `base.pre` and `prepare.pre` run.

- `type` (Required): `"flag"`
- `value` (Optional): A hardcoded boolean flag to explicitly force or skip the release trigger. Default: `false`

### SemverExtension

A discriminated union based on the `type` field. Specifies the type of pre-release/build identifier/metadata.

**Type: `"static"`** - A stable label that should not change often.

- `type` (Required): `"static"`
- `value` (Required): The static string value to use. Examples: `"pre"`, `"alpha"`, `"beta"`, `"rc"`.

**Type: `"dynamic"`** - A label value that often changes per build or commit, usually sourced externally (e.g., git hash, branch name).

- `type` (Required): `"dynamic"`
- `value` (Optional): The string value to use, should be set dynamically.
- `fallback-value` (Optional): The fallback string value used when `value` is empty. If this is also empty, the identifier/metadata will be omitted from the array.

**Type: `"incremental"`** - Integer value that auto-increments by 1.

- `type` (Required): `"incremental"`
- `initial-value` (Optional): Initial integer number value. The value will auto-increment by 1 on each bump. Default: `0`
- `reset-on` (Optional): Resets the incremental value when the specified version component(s) change, could be a single or an array of options. Allowed values: `"major"`, `"minor"`, `"patch"`, `"prerelease"`, `"build"`, and `"none"`. For `"prerelease"` and `"build"`, a reset is triggered only when `"static"` values change, or when `"static"`, `"incremental"`, `"timestamp"` or `"date"` values are added or removed. Any changes to `"dynamic"` values, including their addition or removal, do not trigger a reset. Default: `"none"`

**Type: `"timestamp"`** - Integer value that changes over time, representing a specific point in time since January 1, 1970 (UTC).

- `type` (Required): `"timestamp"`
- `unit` (Optional): The time unit. `"ms"` (13 digits) or `"s"` (10 digits). Default: `"ms"`

**Type: `"date"`** - A date string that changes over time.

- `type` (Required): `"date"`
- `format` (Optional): The date format. `"YYYYMMDD"` or `"YYYY-MM-DD"`. Default: `"YYYYMMDD"`
- `time-zone` (Optional): The timezone to use for the date. If not specified, falls back to base [`time-zone`](#time-zone-optional).
