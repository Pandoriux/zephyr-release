export const CHANGELOG_MARKERS = {
  bodyStart: "<!-- CHANGELOG-BODY-START -->",
  bodyEnd: "<!-- CHANGELOG-BODY-END -->",

  archived: "<!-- ARCHIVED-CONTENT -->",
} as const;

export const PR_MARKERS = {
  bodyStart: "<!-- PR-CHANGELOG-RELEASE-START -->",
  bodyEnd: "<!-- PR-CHANGELOG-RELEASE-END -->",
} as const;
