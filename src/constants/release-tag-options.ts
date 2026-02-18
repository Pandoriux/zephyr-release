export const TagTypeOptions = {
  annotated: "annotated",
  lightweight: "lightweight",
} as const;

export type TagTypeOption = typeof TagTypeOptions[keyof typeof TagTypeOptions];

export const TaggerDateOptions = {
  currentTime: "current_time",
  commitDate: "commit_date",
  authorDate: "author_date",
} as const;

type _TaggerDateOption =
  typeof TaggerDateOptions[keyof typeof TaggerDateOptions];
