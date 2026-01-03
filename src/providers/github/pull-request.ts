import { getOctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type { ProviderPaginatedPullRequest } from "../../types/providers/pull-request.ts";
import { isHttpRequestError } from "../../utils/validations/http-request-error.ts";

export async function githubGetPullRequestsForCommitOrThrow(
  commitHash: string,
  token: string,
): Promise<ProviderPaginatedPullRequest> {
  const octokit = getOctokitClient(token);

  try {
    const res = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      owner: githubGetNamespace(),
      repo: githubGetRepositoryName(),
      commit_sha: commitHash,
      per_page: 100,
    });

    return {
      hasNextPage: res.headers.link?.includes('rel="next"') ?? false,
      data: res.data.map((pr) => ({
        sourceBranch: pr.head.ref,
        targetBranch: pr.base.ref,
      })),
    };
  } catch (error) {
    if (isHttpRequestError(error)) {
      if (error.status === 404) return { hasNextPage: false, data: [] };

      throw new Error(`GitHub API failed (${error.status}): ${error.message}`);
    }

    throw error;
  }
}
