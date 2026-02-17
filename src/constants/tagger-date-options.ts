export const TaggerDateOptions = {
  currentTime: "current_time",
  commitDate: "commit_date",
  authorDate: "author_date",
} as const;

type TaggerDateOption =
  typeof TaggerDateOptions[keyof typeof TaggerDateOptions];
