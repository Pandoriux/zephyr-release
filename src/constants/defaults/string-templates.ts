// Changelog
export const DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE = "# Changelog\n\n<br/>\n";

export const DEFAULT_CHANGELOG_CONTENT_HEADER_TEMPLATE =
  "## ${tagName:mdLink(compare=tagPrev,prev=1)} (${YYYY-MM-DD}) <!-- time-zone: ${timeZone} -->";

export const DEFAULT_CHANGELOG_ENTRY_TEMPLATE =
  "- ${ ${scope} | wrapAroundIfNotEmpty( ( , ): ) } ${desc}" +
  " • " +
  "[${ ${hash} | slice(0, 7) }](${host}/${namespace}/${repository}/)";

// Pull request
export const DEFAULT_PULL_REQUEST_TITLE_TEMPLATE = "chore: release v${version}";

export const DEFAULT_PULL_REQUEST_HEADER_TEMPLATE =
  "🤖 New release created. Stand by for approval";

export const DEFAULT_PULL_REQUEST_BODY_TEMPLATE = "${changelogContent}";

export const DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE =
  "Generated with [Zephyr Release](https://github.com/Pandoriux/zephyr-release)";

// Tag and Release
export const DEFAULT_TAG_NAME_TEMPLATE = "v${version}";

export const DEFAULT_RELEASE_TITLE_TEMPLATE = "${tagName}";

export const DEFAULT_RELEASE_BODY_TEMPLATE = "${changelogContent}";
