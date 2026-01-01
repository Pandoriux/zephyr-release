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

const ConfigFileFormatAliases = {
  yml: "yml",
} as const;

export const ConfigFileFormatMap: Record<
  string,
  ConfigFileFormat | undefined
> = {
  ...Object.fromEntries(
    Object.values(ConfigFileFormats).map((val) => [val, val]),
  ),

  [ConfigFileFormatAliases.yml]: ConfigFileFormats.yaml,
};

const FileFormats = {
  ...ConfigFileFormats,
  txt: "txt",
} as const;

export const FileFormatsWithAuto = {
  ...FileFormats,
  auto: "auto",
} as const;
