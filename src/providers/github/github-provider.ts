import { githubLogger } from "./logger.ts";
import { githubGetRawInputs } from "./inputs.ts";
import { makeGithubGetTextFileOrThrow } from "./file.ts";
import {
  makeGithubCreatePullRequestOrThrow,
  makeGithubFindUniquePullRequestForCommitOrThrow,
  makeGithubFindUniquePullRequestFromBranchOrThrow,
  makeGithubUpdatePullRequestOrThrow,
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
import { makeGithubEnsureBranchExistOrThrow } from "./branch.ts";
import {
  makeGithubCompareCommitsOrThrow,
  makeGithubCreateCommitOnBranchOrThrow,
  makeGithubFindCommitsFromGivenToPreviousTaggedOrThrow,
  makeGithubGetCommitOrThrow,
} from "./commit.ts";
import { githubGetConventionalCommitParserOptions } from "./conventional-commit.ts";
import {
  githubGetCompareTagUrl,
  makeGithubCreateTagOrThrow,
  makeGithubGetCompareTagUrlFromCurrentToLatest,
  makeGithubGetLatestReleaseTagOrThrow,
} from "./tag.ts";
import { getOctokitClient, type OctokitClient } from "./octokit.ts";
import { githubGetOperationTriggerContextOrThrow } from "./operation.ts";
import {
  makeGithubAddLabelsToPullRequestOrThrow,
  makeGithubRemoveLabelFromPullRequestOrThrow,
} from "./label.ts";
import {
  makeGithubAttachReleaseAssetOrThrow,
  makeGithubCreateReleaseOrThrow,
} from "./release.ts";
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
    getCompareTagUrlFromCurrentToLatest:
      makeGithubGetCompareTagUrlFromCurrentToLatest(getOctokit),

    getTextFileOrThrow: makeGithubGetTextFileOrThrow(getOctokit),

    ensureBranchExistOrThrow: makeGithubEnsureBranchExistOrThrow(getOctokit),

    findUniquePullRequestForCommitOrThrow:
      makeGithubFindUniquePullRequestForCommitOrThrow(getOctokit),

    findUniquePullRequestFromBranchOrThrow:
      makeGithubFindUniquePullRequestFromBranchOrThrow(getOctokit),

    findCommitsFromGivenToPreviousTaggedOrThrow:
      makeGithubFindCommitsFromGivenToPreviousTaggedOrThrow(getOctokit),
    compareCommitsOrThrow: makeGithubCompareCommitsOrThrow(getOctokit),
    getCommit: makeGithubGetCommitOrThrow(getOctokit),
    createCommitOnBranchOrThrow:
      makeGithubCreateCommitOnBranchOrThrow(getOctokit),

    createPullRequestOrThrow:
      makeGithubCreatePullRequestOrThrow(getOctokit),
    updatePullRequestOrThrow:
      makeGithubUpdatePullRequestOrThrow(getOctokit),

    addLabelsToPullRequestOrThrow:
      makeGithubAddLabelsToPullRequestOrThrow(getOctokit),
    removeLabelFromPullRequestOrThrow:
      makeGithubRemoveLabelFromPullRequestOrThrow(getOctokit),

    getLatestReleaseTagOrThrow:
      makeGithubGetLatestReleaseTagOrThrow(getOctokit),
    createTagOrThrow: makeGithubCreateTagOrThrow(getOctokit),

    createReleaseOrThrow: makeGithubCreateReleaseOrThrow(getOctokit),
    attachReleaseAssetOrThrow:
      makeGithubAttachReleaseAssetOrThrow(getOctokit),

    exportOutputs: githubExportOutputs,
    exportEnvVars: githubExportEnvVars,

    getConventionalCommitParserOptions:
      githubGetConventionalCommitParserOptions,
  };
}
