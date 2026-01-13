export const NESTED_COMMIT = {
  OVERRIDE: {
    start: "START_OVERRIDE_CHANGES",
    end: "END_OVERRIDE_CHANGES",
  },
  APPEND: {
    start: "START_APPEND_CHANGES",
    end: "END_APPEND_CHANGES",
  },
} as const;

// Create a combined regex for cleaning: (START_A[\s\S]*?END_A)|(START_B[\s\S]*?END_B)
export const NESTED_CLEANING_REGEX = new RegExp(
  Object.values(NESTED_COMMIT)
    .map((block) => `${block.start}[\\s\\S]*?${block.end}`)
    .join("|"),
  "g",
);
