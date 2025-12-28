import type { PlatformProvider } from "../../types/platform-provider.ts";
import { githubResolveConfigOrThrow } from "./config.ts";
import { githubGetInputsOrThrow } from "./inputs.ts";
import { githubLogger } from "./logger.ts";

export const githubProvider: PlatformProvider = {
  platform: "github",

  logger: githubLogger,

  getInputsOrThrow: githubGetInputsOrThrow,
  resolveConfigOrThrow: githubResolveConfigOrThrow,
};
