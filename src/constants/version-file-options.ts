export const VersionFileParsers = {
  auto: "auto",
  json: "json",
  yaml: "yaml",
  toml: "toml",
  txt: "txt",
} as const;

export const VersionFileExtractors = {
  auto: "auto",
  jsonPath: "json-path",
  regex: "regex",
} as const;
