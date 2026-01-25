import { githubLogger } from "./logger.ts";
import { githubGetRawInputs } from "./inputs.ts";
import { githubGetTextFileOrThrow } from "./file.ts";
import {
  githubFindUniquePullRequestForCommitOrThrow,
  githubFindUniquePullRequestFromBranchOrThrow,
} from "./pull-request.ts";
import {
  githubGetCommitPathPart,
  githubGetHost,
  githubGetNamespace,
  githubGetReferencePathPart,
  githubGetRepositoryName,
} from "./repository.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import { githubExportVariables } from "./export.ts";
import { githubEnsureBranchAtCommitOrThrow } from "./branch.ts";
import { githubFindCommitsFromGivenToPreviousTaggedOrThrow } from "./commit.ts";
import { githubGetConventionalCommitParserOptions } from "./conventional-commit.ts";
import { githubManageConcurrency } from "./concurrency.ts";

export const githubProvider = {
  platform: "github",

  logger: githubLogger,

  getInputs: githubGetRawInputs,

  getHost: githubGetHost,
  getNamespace: githubGetNamespace,
  getRepositoryName: githubGetRepositoryName,
  getCommitPathPart: githubGetCommitPathPart,
  getReferencePathPart: githubGetReferencePathPart,

  manageConcurrency: githubManageConcurrency,

  getTextFileOrThrow: githubGetTextFileOrThrow,

  ensureBranchAtCommitOrThrow: githubEnsureBranchAtCommitOrThrow,

  findCommitsFromGivenToPreviousTaggedOrThrow:
    githubFindCommitsFromGivenToPreviousTaggedOrThrow,

  findUniquePullRequestForCommitOrThrow:
    githubFindUniquePullRequestForCommitOrThrow,

  findUniquePullRequestFromBranchOrThrow:
    githubFindUniquePullRequestFromBranchOrThrow,

  exportVariables: githubExportVariables,

  getConventionalCommitParserOptions: githubGetConventionalCommitParserOptions,
} satisfies PlatformProvider;
