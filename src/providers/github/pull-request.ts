import { getOctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type { ProviderPullRequest } from "../../types/providers/pull-request.ts";
import { taskLogger } from "../../tasks/logger.ts";

export async function githubFindUniquePullRequestForCommitOrThrow(
  token: string,
  commitHash: string,
  sourceBranch: string,
  requiredLabel: string,
): Promise<ProviderPullRequest | undefined> {
  let foundPr: ProviderPullRequest | undefined = undefined;
  const orphanPrs: number[] = [];

  const octokit = getOctokitClient(token);
  const paginatedIterator = octokit.paginate.iterator(
    octokit.rest.repos.listPullRequestsAssociatedWithCommit,
    {
      owner: githubGetNamespace(),
      repo: githubGetRepositoryName(),
      commit_sha: commitHash,
      per_page: 100,
    },
  );

  for await (const res of paginatedIterator) {
    for (const pr of res.data) {
      if (pr.head.ref !== sourceBranch) continue;

      const hasLabel = pr.labels.some((l) => l.name === requiredLabel);
      if (hasLabel) {
        if (foundPr) {
          throw new Error(
            `Multiple PRs with label '${requiredLabel}' found while searching for PRs on branch '${sourceBranch}' associated with commit ${
              commitHash.substring(0, 7)
            }`,
          );
        }

        foundPr = {
          sourceBranch: pr.head.ref,
          targetBranch: pr.base.ref,
          label: { name: requiredLabel },
        };
      } else {
        // ORPHAN PRs
        orphanPrs.push(pr.number);
      }
    }
  }

  if (orphanPrs.length > 0) {
    taskLogger.warn(
      `Detected ${orphanPrs.length} "orphan" PRs (#${
        orphanPrs.join(", #")
      }) on branch '${sourceBranch}' without the '${requiredLabel}' label while searching PRs associated with commit ${
        commitHash.substring(0, 7)
      }. These were ignored`,
    );
  }

  return foundPr;
}

export async function githubFindUniquePullRequestFromBranchOrThrow(
  token: string,
  branchName: string,
  requiredLabel: string,
): Promise<ProviderPullRequest | undefined> {
  let foundPr: ProviderPullRequest | undefined = undefined;
  const orphanPrs: number[] = [];

  const octokit = getOctokitClient(token);
  const owner = githubGetNamespace();
  const paginatedIterator = octokit.paginate.iterator(
    octokit.rest.pulls.list,
    {
      owner: owner,
      repo: githubGetRepositoryName(),
      head: `${owner}:${branchName}`,
      per_page: 100,
    },
  );

  for await (const res of paginatedIterator) {
    for (const pr of res.data) {
      const hasLabel = pr.labels.some((l) => l.name === requiredLabel);
      if (hasLabel) {
        if (foundPr) {
          throw new Error(
            `Multiple PRs with label '${requiredLabel}' found while searching for PRs originating from branch '${branchName}'`,
          );
        }

        foundPr = {
          sourceBranch: pr.head.ref,
          targetBranch: pr.base.ref,
          label: { name: requiredLabel },
        };
      } else {
        // ORPHAN PRs
        orphanPrs.push(pr.number);
      }
    }
  }

  if (orphanPrs.length > 0) {
    taskLogger.warn(
      `Detected ${orphanPrs.length} "orphan" PRs (#${
        orphanPrs.join(", #")
      }) originating from branch '${branchName}' without the '${requiredLabel}' label while listing PRs from that branch. These were ignored`,
    );
  }

  return foundPr;
}
