import type { Logger } from "./logger.ts";
import type { RawInputs } from "./raw-inputs.ts";

export interface PlatformProvider {
  platform: "github" | ""; // gitlab? local?

  logger: Logger;

  getRawInputs: () => RawInputs;
  getTextFileOrThrow: (
    workspacePath: string,
    filePath: string,
  ) => Promise<string>;

  // more
}
