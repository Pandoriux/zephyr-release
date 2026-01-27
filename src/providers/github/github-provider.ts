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
import {
  githubGetCompareTagUrl,
  githubGetCompareTagUrlFromCurrentToLatest,
} from "./tag.ts";
import { getOctokitClient } from "./octokit.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";

export function createGitHubProvider(): PlatformProvider {
  // Private state variables held in the closure
  let _inputs: InputsOutput | undefined;
  let _octokit: ReturnType<typeof getOctokitClient> | undefined;

  function ensureProviderContextOrThrow() {
    if (!_inputs) {
      throw new Error(
        "Provider context 'inputs' not initialized. Ensure 'setupProviderContext' is called first",
      );
    }
    if (!_octokit) {
      throw new Error(
        "Provider context 'octokit' not initialized. Ensure 'setupProviderContext' is called first",
      );
    }

    return { inputs: _inputs, octokit: _octokit };
  }

  return {
    platform: "github",

    logger: githubLogger,

    getRawInputs: githubGetRawInputs,
    setupProviderContext: (validatedInputs) => {
      _inputs = validatedInputs;
      _octokit = getOctokitClient(validatedInputs.token);
    },

    getHost: githubGetHost,
    getNamespace: githubGetNamespace,
    getRepositoryName: githubGetRepositoryName,
    getCommitPathPart: githubGetCommitPathPart,
    getReferencePathPart: githubGetReferencePathPart,

    getCompareTagUrl: githubGetCompareTagUrl,

    getCompareTagUrlFromCurrentToLatest: (
      currentTag: string,
      skip?: number,
    ) => {
      const { inputs } = ensureProviderContextOrThrow();
      return githubGetCompareTagUrlFromCurrentToLatest(
        inputs.token,
        currentTag,
        skip,
      );
    },

    manageConcurrency: async () => {
      const { inputs } = ensureProviderContextOrThrow();
      await githubManageConcurrency(inputs.token);
    },

    getTextFileOrThrow: async (filePath: string) => {
      const { inputs } = ensureProviderContextOrThrow();
      return await githubGetTextFileOrThrow(inputs.token, filePath);
    },

    ensureBranchAtCommitOrThrow: async (
      branchName: string,
      commitHash: string,
    ) => {
      const { inputs } = ensureProviderContextOrThrow();
      return await githubEnsureBranchAtCommitOrThrow(
        inputs.token,
        branchName,
        commitHash,
      );
    },

    findCommitsFromGivenToPreviousTaggedOrThrow: async (commitHash: string) => {
      const { inputs } = ensureProviderContextOrThrow();
      return await githubFindCommitsFromGivenToPreviousTaggedOrThrow(
        inputs.token,
        commitHash,
      );
    },

    findUniquePullRequestForCommitOrThrow: async (
      commitHash: string,
      sourceBranch: string,
      label: string,
    ) => {
      const { inputs } = ensureProviderContextOrThrow();
      return await githubFindUniquePullRequestForCommitOrThrow(
        inputs.token,
        commitHash,
        sourceBranch,
        label,
      );
    },

    findUniquePullRequestFromBranchOrThrow: async (
      branchName: string,
      requiredLabel: string,
    ) => {
      const { inputs } = ensureProviderContextOrThrow();
      return await githubFindUniquePullRequestFromBranchOrThrow(
        inputs.token,
        branchName,
        requiredLabel,
      );
    },

    exportVariables: githubExportVariables,

    getConventionalCommitParserOptions:
      githubGetConventionalCommitParserOptions,
  };
}
