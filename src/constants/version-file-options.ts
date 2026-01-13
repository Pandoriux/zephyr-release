export const VersionFileExtractors = {
  jsonPath: "json-path",
  regex: "regex",
} as const;

export type VersionFileExtractor =
  typeof VersionFileExtractors[keyof typeof VersionFileExtractors];

export const VersionFileExtractorsWithAuto = {
  ...VersionFileExtractors,
  auto: "auto",
} as const;
