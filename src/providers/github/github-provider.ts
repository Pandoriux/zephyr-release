import { githubLogger } from "./logger.ts";
import { githubGetRawInputs } from "./inputs.ts";
import { githubGetTextFileOrThrow } from "./file.ts";
import {
  githubFindUniquePullRequestForCommitOrThrow,
  githubFindUniquePullRequestFromBranchOrThrow,
} from "./pull-request.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import { githubExportVariables } from "./export.ts";

export const githubProvider = {
  platform: "github",

  logger: githubLogger,

  getNamespace: githubGetNamespace,
  getRepositoryName: githubGetRepositoryName,

  getInputs: githubGetRawInputs,

  findUniquePullRequestForCommitOrThrow:
    githubFindUniquePullRequestForCommitOrThrow,

  findUniquePullRequestFromBranchOrThrow:
    githubFindUniquePullRequestFromBranchOrThrow,

  getTextFileOrThrow: githubGetTextFileOrThrow,

  exportVariables: githubExportVariables,
} satisfies PlatformProvider;
