/** Fake fn just to get Liquid highlight from extension */
const liquid = String.raw;

// Working branch
export const DEFAULT_WORKING_BRANCH_NAME_TEMPLATE =
  "zephyr-release/{{ triggerBranchName }}";

// Changelog
export const DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE = "# Changelog\n\n<br/>\n";

export const DEFAULT_CHANGELOG_RELEASE_HEADER_TEMPLATE =
  liquid`## {{ tagName | wrap_compare_latest_tag }} (
    {{- YYYY }}-{{ MM }}-{{ DD }}) <!-- timezone: {{ timeZone }} -->`;

export const DEFAULT_CHANGELOG_SECTION_ENTRY_TEMPLATE =
  liquid`- {% if scope %}**{{ scope }}:** {% endif %}{{ desc | format_commit_references: commit }} [{{ hash | slice: 0, 7 }}](
  {{- host }}/{{ namespace }}/{{ repository }}/{{ commitPathPart }}/{{ hash }})`;

export const DEFAULT_CHANGELOG_BREAKING_SECTION_ENTRY_TEMPLATE =
  liquid`- {% if scope %}**{{ scope }}:** {% endif %}{{ breakingDesc }}`;

// Commit
export const DEFAULT_COMMIT_HEADER_TEMPLATE =
  liquid`chore: release v{{ version }}`;

// Proposal (PR, MR, ...)
export const DEFAULT_PROPOSAL_TITLE_TEMPLATE =
  liquid`chore: release v{{ version }}`;

export const DEFAULT_PROPOSAL_HEADER_TEMPLATE =
  "🤖 New release prepared. Awaiting approval~";

export const DEFAULT_PROPOSAL_BODY_TEMPLATE = liquid`{{ changelogRelease }}`;

export const DEFAULT_PROPOSAL_FOOTER_TEMPLATE =
  "Generated with [Zephyr Release](https://github.com/Pandoriux/zephyr-release)";

// Tag and Release
export const DEFAULT_TAG_NAME_TEMPLATE = liquid`v{{ version }}`;

export const DEFAULT_TAG_MESSAGE_TEMPLATE = liquid`Release {{ tagName }}`;

export const DEFAULT_RELEASE_TITLE_TEMPLATE = liquid`{{ tagName }}`;

export const DEFAULT_RELEASE_BODY_TEMPLATE = liquid`{{ changelogRelease }}`;
