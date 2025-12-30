import type { PlatformProvider } from "../../types/platform-provider.ts";
import { githubLogger } from "./logger.ts";
import { githubGetRawInputs } from "./inputs.ts";
import { githubGetTextFileOrThrow } from "./file.ts";

export const githubProvider = {
  platform: "github",

  logger: githubLogger,

  getRawInputs: githubGetRawInputs,
  getTextFileOrThrow: githubGetTextFileOrThrow,
} satisfies PlatformProvider;
