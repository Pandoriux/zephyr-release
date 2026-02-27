# Zephyr Release

> [!WARNING]
> 🚧 Currently under development 🚧

💨🍃 Zephyr Release is yet another automated tool for version bumping, changelog generation, and release publishing.

**It follows Conventional Commits and uses Semantic Versioning for version numbers but skips strict bump rules in favor of a more flexible approach.**

*Designed for my personal use, but may also be useful to others.*

*Hugely inspired by [`googleapis/release-please`](https://github.com/googleapis/release-please) [`googleapis/release-please-action`](https://github.com/googleapis/release-please-action).*

## Key Features

### Adaptable Configuration

Zephyr Release is designed to integrate seamlessly into any environment, providing both a natural fit for your codebase and the flexibility to adapt at runtime.

- **Multiple File Formats:** ZR supports **JSON** (including JSONC and JSON5), **YAML**, and **TOML**. Pick the format that feels most at home in your repository.
- **Flexible Casing:** You don't have to change your coding style to use this tool. ZR provides dedicated schemas for different naming conventions:
  - **Using Python or Rust?** Try the [snake_case schema](./schemas/v1/config-v1.snake.json).
  - **Using JavaScript or C#?** Use the [camelCase schema](./schemas/v1/config-v1.camel.json).
  - **Prefer an agnostic, readable style?** The [kebab-case schema](./schemas/v1/config-v1.kebab.json) is perfect for a clean, language-neutral look.
- **Dynamic Config Overrides:** Need to change settings on the fly? You can inject configuration overrides directly from your CI/CD workflow or generate them at runtime using custom scripts. [Learn more about dynamic overrides](#dynamic-configuration-overrides).

## Getting Started

### First, a config file

below is a minimal working one

```json
{
  // or *.camel.json / *.snake.json
  "$schema": "https://raw.githubusercontent.com/Pandoriux/zephyr-release/refs/heads/main/schemas/v1/config-v1.kebab.json",

  // you need at least 1 primary version file, this is your "source of truth" version
  "version-files": {
    "path": "deno.json",
    "selector": "$.version"
  }
}

```

> *for full list of options, see [config-options.md](./docs/config-options.md)*

### Second, an input file

For github, it is your `.github/workflows/zephyr-release.yml`

```yaml
name: Zephyr Release

on:
  push:
    branches:
      - main # Or your default branch

# !IMPORTANT: Prevents parallel runs and forces them into a safe queue.
concurrency:
  # The group name can be anything, but combining these two variables is best practice:
  # github.workflow: The name of this workflow (e.g., "Zephyr Release").
  # github.ref: The branch ref. Ensures pushes to different branches (e.g., 'main' vs 'dev') don't block each other.
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  zephyr-release:
    runs-on: ubuntu-latest
    
    # Permissions are only needed if you use default GITHUB_TOKEN
    # For a PAT or GitHub App token, permissions are set by you on creation
    # permissions:
    #   contents: write       
    #   pull-requests: write 
    #   issues: write
    #   actions: write

    steps:
      # Optional checkout
      # - name: Checkout Code
      #   uses: actions/checkout@v4

      - name: Run Zephyr Release
        uses: Pandoriux/zephyr-release@v1
        with:
          token: ${{ secrets.CUSTOM_TOKEN }} # Omit this line to use the default GITHUB_TOKEN
          config-path: ".github/zephyr-release-config.jsonc"
          config-format: "jsonc"

          # Override specific config values directly in the workflow
          config-override: |
            {
              "name": "Override name"
            }
          
          # See docs for all available source-mode options: 
          # https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional
          source-mode: "local"
```

> *for full list of options, see [inputs-options.md](./docs/input-options.md)*

### ⚠️ Crucial: Managing Concurrency

Because Zephyr Release resolves history up to the specific trigger commit to manage proposal PRs and tags/releases, running multiple workflows at the same time can lead to collisions or race conditions.  
To prevent this, you must handle **parallel runs (concurrency)** by putting workflows into a queue so they run one-at-a-time (as shown above)

<br/>

**More examples:** [examples](./docs/examples/)

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
feat: add multiple changes

this is PR commit body

footer: zephyr

START_OVERRIDE_CHANGES
feat: add authentication layer
fix: resolve memory leak in worker threads
docs: update API documentation
END_OVERRIDE_CHANGES
```

### 2. The Proposal

Once a change is detected, Zephyr Release automatically creates (or updates) a **"Release Proposal" Pull Request**.

- **Version Calculation**: It calculates the next [Semantic Version](https://semver.org/) based on your commit history.
- **File Updates**: It updates the version in the files defined in your `version-files` configuration (e.g., `deno.json`).
- **Changelog Preview**: It generates a preview of the upcoming release notes for your review.
- **Sync**: The PR stays open and updates automatically with every new commit pushed to your branch.

### 3. The Release

When you are ready to ship, simply **merge** the "Release Proposal" PR. Zephyr Release detects that this specific "propose" commit has landed in your default branch and will:

- **Create a Git Tag**: Automatically tags the repository with the new version number.
- **Publish Release Notes**: Generates and publishes the final release.

## Dynamic Configuration Overrides

Sometimes a static configuration file is not enough. For example, you might want to dynamically change the release notes based on the current branch or an external API. Zephyr Release gives you two ways to change your settings on the fly:

**1. Workflow Input Override:** You can generate configuration data in an earlier step of your CI/CD workflow and pass it directly into the operation using the [`config-override`](./docs/input-options.md#config-override-optional) input. This is great if your workflow already knows what needs to change before Zephyr Release even starts.

**2. Runtime File Override:** If you need to calculate settings *during* the release process itself, you can use [`runtime-config-override`](./docs/config-options.md#runtime-config-override-optional).
By pairing it with various [`command-hook`](./docs/config-options.md#command-hook-optional) options, you can run a custom script that generates a temporary JSON file on the runner. Zephyr Release will automatically read this file and merge it into your configuration after every `command-hook` run.

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
- **Permissions:** By default, any commit can use this. However, you can change the [`allowed-release-as-commit-types`](./docs/config-options.md#allowed-release-as-commit-types-optional) setting in your config if you only want certain commit types (like `feat`) to be allowed to force a version.
