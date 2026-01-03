import { githubLogger } from "./logger.ts";
import { githubGetRawInputs } from "./inputs.ts";
import { githubGetTextFileOrThrow } from "./file.ts";
import { githubGetPullRequestsForCommitOrThrow } from "./pull-request.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";

export const githubProvider = {
  platform: "github",

  logger: githubLogger,

  getNamespace: githubGetNamespace,
  getRepositoryName: githubGetRepositoryName,

  getInputs: githubGetRawInputs,

  getPullRequestsForCommitOrThrow: githubGetPullRequestsForCommitOrThrow,

  getTextFileOrThrow: githubGetTextFileOrThrow,
} satisfies PlatformProvider;
