import { getOctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type { ProviderPullRequest } from "../../types/providers/pull-request.ts";
import { taskLogger } from "../../tasks/logger.ts";

export async function githubGetPullRequestsForCommitOrThrow(
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
            `Multiple PRs with label '${requiredLabel}' found for branch '${sourceBranch}' on commit ${
              commitHash.substring(0, 7)
            }.`,
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
      }) on branch '${sourceBranch}' without the '${requiredLabel}' label. These were ignored.`,
    );
  }

  return foundPr;
}
