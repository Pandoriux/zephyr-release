export const TagTypeOptions = {
  annotated: "annotated",
  lightweight: "lightweight",
} as const;

export type TagTypeOption = typeof TagTypeOptions[keyof typeof TagTypeOptions];

export const TaggerDateOptions = {
  now: "now",
  commitDate: "commit-date",
  authorDate: "author-date",
} as const;

type _TaggerDateOption =
  typeof TaggerDateOptions[keyof typeof TaggerDateOptions];
