import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import { githubLogger } from "./logger.ts";
import { githubGetRawInputs } from "./inputs.ts";
import { githubGetTextFileOrThrow } from "./file.ts";
import { githubGetPullRequestsForCommit } from "./pull-request.ts";

export const githubProvider = {
  platform: "github",

  logger: githubLogger,

  getInputs: githubGetRawInputs,

  getPullRequestsForCommit: githubGetPullRequestsForCommit,

  getTextFileOrThrow: githubGetTextFileOrThrow,
} satisfies PlatformProvider;
