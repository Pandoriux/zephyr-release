import { githubLogger } from "./logger.ts";
import { githubGetRawInputs } from "./inputs.ts";
import { githubGetTextFileOrThrow } from "./file.ts";
import {
  githubCreatePullRequestOrThrow,
  githubFindUniquePullRequestForCommitOrThrow,
  githubFindUniquePullRequestFromBranchOrThrow,
  githubUpdatePullRequestOrThrow,
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
  githubCompareCommitsOrThrow,
  githubCreateCommitOnBranchOrThrow,
  githubFindCommitsFromGivenToPreviousTaggedOrThrow,
} from "./commit.ts";
import { githubGetConventionalCommitParserOptions } from "./conventional-commit.ts";
import { githubManageConcurrency } from "./concurrency.ts";
import {
  githubCreateTagOrThrow,
  githubGetCompareTagUrl,
  githubGetCompareTagUrlFromCurrentToLatest,
  githubGetLatestReleaseTagOrThrow,
} from "./tag.ts";
import { getOctokitClient, type OctokitClient } from "./octokit.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";
import { githubGetOperationTriggerContextOrThrow } from "./operation.ts";
import { githubAddLabelsToPullRequestOrThrow } from "./label.ts";

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
    getOperationTriggerContextOrThrow: githubGetOperationTriggerContextOrThrow,

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
      return await githubManageConcurrency(octokit);
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

    findUniquePullRequestForCommitOrThrow: async (
      commitHash: string,
      sourceBranch: string,
      targetBranch: string,
      label: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubFindUniquePullRequestForCommitOrThrow(
        octokit,
        commitHash,
        sourceBranch,
        targetBranch,
        label,
      );
    },

    findUniquePullRequestFromBranchOrThrow: async (
      branchName: string,
      targetBranch: string,
      requiredLabel: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubFindUniquePullRequestFromBranchOrThrow(
        octokit,
        branchName,
        targetBranch,
        requiredLabel,
      );
    },

    findCommitsFromGivenToPreviousTaggedOrThrow: async (commitHash: string) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubFindCommitsFromGivenToPreviousTaggedOrThrow(
        octokit,
        commitHash,
      );
    },
    compareCommitsOrThrow: async (
      base: string,
      head: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubCompareCommitsOrThrow(
        octokit,
        base,
        head,
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

    createPullRequestOrThrow: async (
      sourceBranch: string,
      targetBranch: string,
      title: string,
      body: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubCreatePullRequestOrThrow(
        octokit,
        sourceBranch,
        targetBranch,
        title,
        body,
      );
    },
    updatePullRequestOrThrow: async (
      number: number,
      title: string,
      body: string,
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubUpdatePullRequestOrThrow(
        octokit,
        number,
        title,
        body,
      );
    },

    addLabelsToPullRequestOrThrow: async (
      prNumber: number,
      labels: { name: string; color?: string; description?: string }[],
      optionalLabel?: string[],
    ) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubAddLabelsToPullRequestOrThrow(
        octokit,
        prNumber,
        labels,
        optionalLabel,
      );
    },

    getLatestReleaseTagOrThrow: async () => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubGetLatestReleaseTagOrThrow(octokit);
    },
    createTagOrThrow: async (tagName: string, commitHash: string) => {
      const { octokit } = ensureProviderContextOrThrow();
      return await githubCreateTagOrThrow(octokit, tagName, commitHash);
    },

    exportOutputs: githubExportOutputs,
    exportEnvVars: githubExportEnvVars,

    getConventionalCommitParserOptions:
      githubGetConventionalCommitParserOptions,
  };
}
