# Zephyr Release

> [!WARNING]
> 🚧 Currently under development 🚧

💨🍃 Zephyr Release is yet another automated tool for version bumping, changelog generation, and release publishing.

**It follows Conventional Commits and uses Semantic Versioning for version numbers but skips strict bump rules in favor of a more flexible approach.**

*Designed for my personal use, but may also be useful to others.*

*Hugely inspired by [`googleapis/release-please`](https://github.com/googleapis/release-please) [`googleapis/release-please-action`](https://github.com/googleapis/release-please-action).*

## Getting Started

First, you will need a config file, below is a minial working one:

```json
{
  "$schema": "../../schemas/config-v1.json",

  "version-files": {
    "path": "deno.json",
    "selector": "$.version"
  }
}
```

> for full list of options, see [config-options.md](https://github.com/Pandoriux/zephyr-release/blob/main/docs/config-options.md)

Second, you need an input file. For github, it is your `.github/workflows/zephyr-release.yml`:

```yaml
name: Zephyr Release

on:
  push:
    branches:
      - main # Or your default branch

jobs:
  zephyr-release:
    runs-on: ubuntu-latest
    
    # Permissions are only needed if you use default GITHUB_TOKEN
    # For a PAT or GitHub App token, permissions are set by you on creation
    permissions:
      contents: write       
      pull-requests: write 
      actions: write

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run Zephyr Release
        uses: owner/repo@v1
        with:
          token: ${{ secrets.CUSTOM_TOKEN }} # Omit this line to use the default GITHUB_TOKEN
          config-path: ".github/zephyr-release-config.jsonc"
          config-format: "jsonc"

          # Override specific config values directly in the workflow
          config-override: |
            {
              "name": "Override name"
            }
          
          # See docs for all available source-mode options: [link]
          source-mode: "local"
```

> for full list of options, see [inputs-options.md](https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md)

<br/>

**See more examples[links].**

## How It Work

Zephyr Release follows a three-step cycle to automate your versioning and changelogs while ensuring you maintain control over the final release.

### 1. The Trigger

Begin by creating commits that follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. If you are working through Pull Requests (recommended), you *should* use **Squash and Merge** to maintain a linear git history.

#### Handling Multiple Changes in one PR

If a single PR contains multiple features or fixes that need individual entries, you can use `APPEND` or `OVERRIDE` blocks in your PR commit body. Zephyr Release will parse these block and treat each entry as an individual commit for versioning purposes (which will affect both calculating next version and changelog generation).

> Each entry must be a single line and follow conventional format: `<type>(<scope>)<!>: <description>`.
>
> If both `APPEND` and `OVERRIDE` block exist, `OVERRIDE` will take over.

Example:

```text
feat(ci): handle multiple changes

this is PR commit body

footer: zephyr

START_OVERRIDE_CHANGES
feat: add authentication layer
fix: resolve memory leak in worker threads
docs: update API documentation
END_OVERRIDE_CHANGES
```

### 2. The Preparation

Once a change is detected, Zephyr Release automatically creates (or updates) a **"Release Preparation" Pull Request**.

- **Version Calculation**: It calculates the next [Semantic Version](https://semver.org/) based on your commit history.
- **File Updates**: It updates the version in the files defined in your `version-files` configuration (e.g., `deno.json`).
- **Changelog Preview**: It generates a preview of the upcoming release notes for your review.
- **Sync**: The PR stays open and updates automatically with every new commit pushed to your branch.

### 3. The Release

When you are ready to ship, simply **merge** the "Release Preparation" PR. Zephyr Release detects that this specific "prepare" commit has landed in your default branch and will:

- **Create a Git Tag**: Automatically tags the repository with the new version number.
- **Publish Release Notes**: Generates and publishes the final release.

## Force a Specific Version

Sometimes you need to set a version number manually instead of letting the tool calculate it for you.

You can do this by adding `release-as:` or `release as:` (case insensitive) followed by the version you want.

**Example:**

```text
feat: add a massive new feature

This change is so big we want to jump to 2.0.0.

release-as: 2.0.0
```

### Important things to know

- **Only the current commit works:** Zephyr Release only looks for this footer in the **specific commit** that triggers the release. If you had a "release-as" footer in an old commit from last week, it will be ignored.
- **Permissions:** By default, any commit can use this. However, you can change the [`allowReleaseAs`](https://github.com/Pandoriux/zephyr-release/blob/main/docs/config-options.md#allow-release-as-optional) setting in your config if you only want certain commit types (like `feat`) to be allowed to force a version.
