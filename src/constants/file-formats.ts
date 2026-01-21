export const ConfigFileFormats = {
  json: "json",
  jsonc: "jsonc",
  json5: "json5",
  yaml: "yaml",
  toml: "toml",
} as const;

export type ConfigFileFormat =
  typeof ConfigFileFormats[keyof typeof ConfigFileFormats];

export const ConfigFileFormatsWithAuto = {
  ...ConfigFileFormats,
  auto: "auto",
} as const;

export type ConfigFileFormatWithAuto =
  typeof ConfigFileFormatsWithAuto[keyof typeof ConfigFileFormatsWithAuto];

export const FileFormats = {
  ...ConfigFileFormats,
  txt: "txt",
} as const;
export type FileFormat = typeof FileFormats[keyof typeof FileFormats];

export const FileFormatsWithAuto = {
  ...FileFormats,
  auto: "auto",
} as const;

export type FileFormatWithAuto =
  typeof FileFormatsWithAuto[keyof typeof FileFormatsWithAuto];

const FileFormatAliases = {
  yml: "yml",
} as const;

export const ConfigFileFormatMap: Record<
  string,
  ConfigFileFormat | undefined
> = {
  ...Object.fromEntries(
    Object.values(ConfigFileFormats).map((val) => [val, val]),
  ),

  [FileFormatAliases.yml]: ConfigFileFormats.yaml,
};

export const FileFormatMap: Record<
  string,
  FileFormat | undefined
> = {
  ...Object.fromEntries(
    Object.values(FileFormats).map((val) => [val, val]),
  ),

  [FileFormatAliases.yml]: FileFormats.yaml,
};
