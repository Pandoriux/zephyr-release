import type { Logger } from "./logger.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ConfigFileFormatWithAuto } from "../constants/file-formats.ts";

export interface PlatformProvider {
  platform: "github";

  logger: Logger;

  getInputsOrThrow: () => InputsOutput;
  resolveConfigOrThrow: (
    workspacePath: string,
    configPath: string,
    configFormat: ConfigFileFormatWithAuto,
    configOverrideStr: string,
    configOverrideFormat: ConfigFileFormatWithAuto,
  ) => ConfigOutput;

  // more
}
