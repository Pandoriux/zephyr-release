// Changelog
export const DEFAULT_CHANGELOG_HEADING_PATTERN =
  "${version} (${yyyy-mm-dd}) <!-- time-zone: ${timeZone} -->";

export const DEFAULT_CHANGELOG_BODY_PATTERN = "${changelog}";

// Pull request
export const DEFAULT_PULL_REQUEST_TITLE_PATTERN = "chore: release v${version}";

export const DEFAULT_PULL_REQUEST_HEADER_PATTERN =
  "🤖 New release created. Stand by for approval";

export const DEFAULT_PULL_REQUEST_BODY_PATTERN = "${changelog}";

export const DEFAULT_PULL_REQUEST_FOOTER_PATTERN =
  "Generated with [Zephyr Release](https://github.com/Pandoriux/zephyr-release)";
