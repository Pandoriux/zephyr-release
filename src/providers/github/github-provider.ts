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
import { githubEnsureBranchAtCommitOrThrow } from "./branch.ts";
import { githubFindCommitsFromGivenToPreviousTaggedOrThrow } from "./commit.ts";

export const githubProvider = {
  platform: "github",

  logger: githubLogger,

  getInputs: githubGetRawInputs,

  getNamespace: githubGetNamespace,
  getRepositoryName: githubGetRepositoryName,

  getTextFileOrThrow: githubGetTextFileOrThrow,

  ensureBranchAtCommitOrThrow: githubEnsureBranchAtCommitOrThrow,

  findCommitsFromGivenToPreviousTaggedOrThrow:
    githubFindCommitsFromGivenToPreviousTaggedOrThrow,

  findUniquePullRequestForCommitOrThrow:
    githubFindUniquePullRequestForCommitOrThrow,

  findUniquePullRequestFromBranchOrThrow:
    githubFindUniquePullRequestFromBranchOrThrow,

  exportVariables: githubExportVariables,
} satisfies PlatformProvider;
