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
  githubGetCommitOrThrow,
} from "./commit.ts";
import { githubGetConventionalCommitParserOptions } from "./conventional-commit.ts";
import {
  githubCreateTagOrThrow,
  githubGetCompareTagUrl,
  githubGetCompareTagUrlFromCurrentToLatest,
  githubGetLatestReleaseTagOrThrow,
} from "./tag.ts";
import { getOctokitClient, type OctokitClient } from "./octokit.ts";
import { githubGetOperationTriggerContextOrThrow } from "./operation.ts";
import {
  githubAddLabelsToPullRequestOrThrow,
  githubRemoveLabelFromPullRequestOrThrow,
} from "./label.ts";
import type { ProviderLabelOptions } from "../../types/providers/label.ts";
import type { TaggerRequest } from "../../types/tag.ts";
import type { TagTypeOption } from "../../constants/release-tag-options.ts";
import {
  githubAttachReleaseAssetOrThrow,
  githubCreateReleaseOrThrow,
} from "./release.ts";
import type {
  ProviderAssetParams,
  ProviderReleaseOptions,
} from "../../types/providers/release.ts";
import { githubGetReferenceUrl } from "./reference.ts";

export function createGitHubProvider(): PlatformProvider {
  // Private state variables held in the closure
  let _octokit: OctokitClient | undefined;

  function getOctokit() {
    if (!_octokit) {
      throw new Error(
        "Provider context 'octokit' not initialized. Ensure 'setupProviderContext' is called first",
      );
    }

    return _octokit;
  }

  return {
    platform: "github",

    logger: githubLogger,

    getRawInputs: githubGetRawInputs,
    setupProviderContext: (validatedInputs) => {
      _octokit = getOctokitClient(validatedInputs.token);
    },

    getHost: githubGetHost,
    getNamespace: githubGetNamespace,
    getRepositoryName: githubGetRepositoryName,
    getCommitPathPart: githubGetCommitPathPart,
    getReferencePathPart: githubGetReferencePathPart,
    getOperationTriggerContextOrThrow: githubGetOperationTriggerContextOrThrow,

    getReferenceUrl: githubGetReferenceUrl,
    getCompareTagUrl: githubGetCompareTagUrl,
    getCompareTagUrlFromCurrentToLatest: (
      currentTag: string,
      skip?: number,
    ) => {
      return githubGetCompareTagUrlFromCurrentToLatest(
        getOctokit(),
        currentTag,
        skip,
      );
    },

    getTextFileOrThrow: async (filePath: string, ref?: string) => {
      return await githubGetTextFileOrThrow(getOctokit(), filePath, ref);
    },

    ensureBranchExistOrThrow: async (
      branchName: string,
      commitHash: string,
    ) => {
      return await githubEnsureBranchExistOrThrow(
        getOctokit(),
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
      return await githubFindUniquePullRequestForCommitOrThrow(
        getOctokit(),
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
      return await githubFindUniquePullRequestFromBranchOrThrow(
        getOctokit(),
        branchName,
        targetBranch,
        requiredLabel,
      );
    },

    findCommitsFromGivenToPreviousTaggedOrThrow: async (
      commitHash: string,
      stopResolvingCommitAt?: number | string,
    ) => {
      return await githubFindCommitsFromGivenToPreviousTaggedOrThrow(
        getOctokit(),
        commitHash,
        stopResolvingCommitAt,
      );
    },
    compareCommitsOrThrow: async (
      base: string,
      head: string,
    ) => {
      return await githubCompareCommitsOrThrow(
        getOctokit(),
        base,
        head,
      );
    },
    getCommit: async (hash: string) => {
      return await githubGetCommitOrThrow(getOctokit(), hash);
    },
    createCommitOnBranchOrThrow: async (
      triggerCommitHash: string,
      baseTreeHash: string,
      changesToCommit: Map<string, string>,
      message: string,
      workingBranchName: string,
    ) => {
      return await githubCreateCommitOnBranchOrThrow(
        getOctokit(),
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
      return await githubCreatePullRequestOrThrow(
        getOctokit(),
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
      return await githubUpdatePullRequestOrThrow(
        getOctokit(),
        number,
        title,
        body,
      );
    },

    addLabelsToPullRequestOrThrow: async (
      prNumber: number,
      labelOptions: ProviderLabelOptions,
    ) => {
      return await githubAddLabelsToPullRequestOrThrow(
        getOctokit(),
        prNumber,
        labelOptions,
      );
    },
    removeLabelFromPullRequestOrThrow: async (
      prNumber: number,
      label: string,
    ) => {
      return await githubRemoveLabelFromPullRequestOrThrow(
        getOctokit(),
        prNumber,
        label,
      );
    },

    getLatestReleaseTagOrThrow: async () => {
      return await githubGetLatestReleaseTagOrThrow(getOctokit());
    },
    createTagOrThrow: async (
      tagName: string,
      commitHash: string,
      tagType: TagTypeOption,
      message: string,
      tagger?: TaggerRequest,
    ) => {
      return await githubCreateTagOrThrow(
        getOctokit(),
        tagName,
        commitHash,
        tagType,
        message,
        tagger,
      );
    },

    createReleaseOrThrow: async (
      tagName: string,
      title: string,
      body: string,
      options: ProviderReleaseOptions,
    ) => {
      return await githubCreateReleaseOrThrow(
        getOctokit(),
        tagName,
        title,
        body,
        options,
      );
    },
    attachReleaseAssetOrThrow: async (
      releaseId: string,
      asset: ProviderAssetParams,
    ) => {
      return await githubAttachReleaseAssetOrThrow(
        getOctokit(),
        releaseId,
        asset,
      );
    },

    exportOutputs: githubExportOutputs,
    exportEnvVars: githubExportEnvVars,

    getConventionalCommitParserOptions:
      githubGetConventionalCommitParserOptions,
  };
}
