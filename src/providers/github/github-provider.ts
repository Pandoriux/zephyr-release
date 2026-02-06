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
import { githubExportEnvVars, githubExportOutputs } from "./export.ts";
import { githubEnsureBranchExistOrThrow } from "./branch.ts";
import {
  githubCreateCommitOnBranchOrThrow,
  githubFindCommitsFromGivenToPreviousTaggedOrThrow,
} from "./commit.ts";
import { githubGetConventionalCommitParserOptions } from "./conventional-commit.ts";
import { githubManageConcurrency } from "./concurrency.ts";
import {
  githubGetCompareTagUrl,
  githubGetCompareTagUrlFromCurrentToLatest,
} from "./tag.ts";
import { getOctokitClient, OctokitClient } from "./octokit.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";

export function createGitHubProvider(): PlatformProvider {
  // Private state variables held in the closure
  let _inputs: InputsOutput | undefined;
  let _octokit: OctokitClient | undefined;

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
      const { octokit } = ensureProviderContextOrThrow();
      return githubGetCompareTagUrlFromCurrentToLatest(
        octokit,
        currentTag,
        skip,
      );
    },

    manageConcurrency: async () => {
      const { octokit } = ensureProviderContextOrThrow();
      await githubManageConcurrency(octokit);
    },

    getTextFileOrThrow: async (filePath: string) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubGetTextFileOrThrow(octokit, filePath);
    },

    ensureBranchExistOrThrow: async (
      branchName: string,
      commitHash: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubEnsureBranchExistOrThrow(
        octokit,
        branchName,
        commitHash,
      );
    },

    findCommitsFromGivenToPreviousTaggedOrThrow: async (commitHash: string) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubFindCommitsFromGivenToPreviousTaggedOrThrow(
        octokit,
        commitHash,
      );
    },

    findUniquePullRequestForCommitOrThrow: async (
      commitHash: string,
      sourceBranch: string,
      label: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubFindUniquePullRequestForCommitOrThrow(
        octokit,
        commitHash,
        sourceBranch,
        label,
      );
    },

    findUniquePullRequestFromBranchOrThrow: async (
      branchName: string,
      requiredLabel: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubFindUniquePullRequestFromBranchOrThrow(
        octokit,
        branchName,
        requiredLabel,
      );
    },

    createCommitOnBranchOrThrow: async (
      triggerCommitHash: string,
      baseTreeHash: string,
      changesToCommit: Map<string, string>,
      message: string,
      workingBranchName: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubCreateCommitOnBranchOrThrow(
        octokit,
        {
          triggerCommitHash,
          baseTreeHash,
          changesToCommit,
          message,
          workingBranchName,
        },
      );
    },

    exportOutputs: githubExportOutputs,
    exportEnvVars: githubExportEnvVars,

    getConventionalCommitParserOptions:
      githubGetConventionalCommitParserOptions,
  };
}
