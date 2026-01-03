import * as github from "@actions/github";
import type { ProviderPullRequest } from "../../types/providers/pull-request.ts";
import { isHttpRequestError } from "../../utils/validations/http-request-error.ts";

export async function githubGetPullRequestsForCommit(
  commitHash: string,
  token: string,
): Promise<ProviderPullRequest> {
  try {
    const res = await github.getOctokit(token).rest.repos
      .listPullRequestsAssociatedWithCommit({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
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
