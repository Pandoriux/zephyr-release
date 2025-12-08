// Changelog
export const DEFAULT_CHANGELOG_HEADER_PATTERN = "# Changelog\n";

export const DEFAULT_CHANGELOG_HEADING_PATTERN =
  "## ${tagName:mdLink(compare=tagPrev,prev=1)} (${YYYY-MM-DD}) <!-- time-zone: ${timeZone} -->";

export const DEFAULT_CHANGELOG_BODY_PATTERN = "${changelogContentBody}";

// Pull request
export const DEFAULT_PULL_REQUEST_TITLE_PATTERN = "chore: release v${version}";

export const DEFAULT_PULL_REQUEST_HEADER_PATTERN =
  "🤖 New release created. Stand by for approval";

export const DEFAULT_PULL_REQUEST_BODY_PATTERN = "${changelogContent}";

export const DEFAULT_PULL_REQUEST_FOOTER_PATTERN =
  "Generated with [Zephyr Release](https://github.com/Pandoriux/zephyr-release)";

// Tag and Release
export const DEFAULT_TAG_NAME_PATTERN = "v${version}";

export const DEFAULT_RELEASE_TITLE_PATTERN = "${tagName}";

export const DEFAULT_RELEASE_BODY_PATTERN = "${changelogContent}";
