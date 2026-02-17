/** Fake fn just to get Liquid highlight from extension */
const liquid = String.raw;

// Changelog
export const DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE = "# Changelog\n\n<br/>\n";

export const DEFAULT_CHANGELOG_RELEASE_HEADER_TEMPLATE =
  liquid`## {{ tagName | md_link_compare_tag_from_current_to_latest }} (
    {{- YYYY }}-{{ MM }}-{{ DD }}) <!-- timezone: {{ timeZone }} -->`;

export const DEFAULT_CHANGELOG_SECTION_ENTRY_TEMPLATE =
  liquid`- {% if scope %}**{{ scope }}:** {% endif %}{{ desc }} [{{ hash | slice: 0, 7 }}](
  {{- host }}/{{ namespace }}/{{ repository }}/{{ commitPathPart }}/{{ hash }})`;

// Pull request
export const DEFAULT_PULL_REQUEST_TITLE_TEMPLATE =
  liquid`chore: release v{{ version }}`;

export const DEFAULT_PULL_REQUEST_HEADER_TEMPLATE =
  "🤖 New release prepared. Awaiting approval~";

export const DEFAULT_PULL_REQUEST_BODY_TEMPLATE =
  liquid`{{ changelogRelease }}`;

export const DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE =
  "Generated with [Zephyr Release](https://github.com/Pandoriux/zephyr-release)";

// Tag and Release
export const DEFAULT_TAG_NAME_TEMPLATE = liquid`v{{ version }}`;

export const DEFAULT_RELEASE_TITLE_TEMPLATE = liquid`{{ tagName }}`;

export const DEFAULT_RELEASE_BODY_TEMPLATE = liquid`{{ changelogRelease }}`;

export const DEFAULT_TAG_MESSAGE_TEMPLATE = liquid`Release {{ version }}`;