import type { OctokitClient } from "./octokit.ts";
import * as v from "@valibot/valibot";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type { ProviderPullRequest } from "../../types/providers/pull-request.ts";

const RawPullRequestNodeSchema = v.object({
  number: v.number(),
  headRefName: v.string(),
  baseRefName: v.string(),
  state: v.string(),
  title: v.string(),
  body: v.string(),
  labels: v.object({
    nodes: v.array(
      v.object({
        name: v.string(),
      }),
    ),
  }),
});

const RawCommitPullRequestsSchema = v.object({
  repository: v.object({
    object: v.nullable(
      v.object({
        associatedPullRequests: v.object({
          nodes: v.array(RawPullRequestNodeSchema),
          pageInfo: v.object({
            hasNextPage: v.boolean(),
            endCursor: v.string(),
          }),
        }),
      }),
    ),
  }),
});

const RawBranchPullRequestsSchema = v.object({
  repository: v.object({
    pullRequests: v.object({
      nodes: v.array(RawPullRequestNodeSchema),
      pageInfo: v.object({
        hasNextPage: v.boolean(),
        endCursor: v.string(),
      }),
    }),
  }),
});

export async function githubFindUniquePullRequestForCommitOrThrow(
  octokit: OctokitClient,
  commitHash: string,
  sourceBranch: string,
  targetBranch: string,
  requiredLabel: string,
): Promise<ProviderPullRequest | undefined> {
  let foundPr: ProviderPullRequest | undefined = undefined;

  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  const paginatedIterator = octokit.graphql.paginate.iterator(
    `
    query getPullRequestsForCommit($owner: String!, $repo: String!, $sha: GitObjectID!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        object(oid: $sha) {
          ... on Commit {
            associatedPullRequests(first: 100, after: $cursor) @paginate {
              nodes {
                number
                headRefName
                baseRefName
                state
                title
                body
                labels(first: 100) {
                  nodes {
                    name
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
    }
  `,
    {
      owner,
      repo,
      sha: commitHash,
    },
  );

  for await (const response of paginatedIterator) {
    const rawResponse = v.parse(RawCommitPullRequestsSchema, response, {
      message: "Received malformed pull request data from GitHub GraphQL API",
    });

    const commitObject = rawResponse.repository.object;
    if (!commitObject || commitObject === null) {
      continue;
    }

    for (const pr of commitObject.associatedPullRequests.nodes) {
      if (pr.headRefName !== sourceBranch || pr.baseRefName !== targetBranch) {
        continue;
      }

      const hasLabel = pr.labels.nodes.some((l) => l.name === requiredLabel);
      if (hasLabel) {
        if (foundPr) {
          throw new Error(
            `Multiple PRs with label '${requiredLabel}' found while searching for PRs on branch '${sourceBranch}' targeting '${targetBranch}' associated with commit ${
              commitHash.substring(0, 7)
            }`,
          );
        }

        foundPr = {
          number: pr.number,
          sourceBranch: pr.headRefName,
          targetBranch: pr.baseRefName,
          title: pr.title,
          body: pr.body,
        };
      }
    }
  }

  return foundPr;
}

export async function githubFindUniquePullRequestFromBranchOrThrow(
  octokit: OctokitClient,
  branchName: string,
  targetBranch: string,
  requiredLabel: string,
): Promise<ProviderPullRequest | undefined> {
  let foundPr: ProviderPullRequest | undefined = undefined;

  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  const paginatedIterator = octokit.graphql.paginate.iterator(
    `
    query getPullRequestsFromBranch($owner: String!, $repo: String!, $headRefName: String!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        pullRequests(first: 100, after: $cursor, states: [OPEN], headRefName: $headRefName) @paginate {
          nodes {
            number
            headRefName
            baseRefName
            state
            title
            body
            labels(first: 100) {
              nodes {
                name
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `,
    {
      owner,
      repo,
      headRefName: branchName,
    },
  );

  for await (const response of paginatedIterator) {
    const rawResponse = v.parse(RawBranchPullRequestsSchema, response, {
      message: "Received malformed pull request data from GitHub GraphQL API",
    });

    for (const pr of rawResponse.repository.pullRequests.nodes) {
      if (pr.baseRefName !== targetBranch) {
        continue;
      }

      const hasLabel = pr.labels.nodes.some((l) => l.name === requiredLabel);
      if (hasLabel) {
        if (foundPr) {
          throw new Error(
            `Multiple PRs with label '${requiredLabel}' found while searching for PRs originating from branch '${branchName}' targeting '${targetBranch}'`,
          );
        }

        foundPr = {
          number: pr.number,
          sourceBranch: pr.headRefName,
          targetBranch: pr.baseRefName,
          title: pr.title,
          body: pr.body,
        };
      }
    }
  }

  return foundPr;
}

export async function githubCreatePullRequestOrThrow(
  octokit: OctokitClient,
  sourceBranch: string,
  targetBranch: string,
  title: string,
  body: string,
): Promise<ProviderPullRequest> {
  const res = await octokit.rest.pulls.create({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    head: sourceBranch,
    base: targetBranch,
    title,
    body,
  });

  return {
    number: res.data.number,
    sourceBranch: res.data.head.ref,
    targetBranch: res.data.base.ref,
    title: res.data.title,
    body: res.data.body || "",
  };
}

export async function githubUpdatePullRequestOrThrow(
  octokit: OctokitClient,
  number: number,
  title: string,
  body: string,
): Promise<ProviderPullRequest> {
  const res = await octokit.rest.pulls.update({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    pull_number: number,
    title,
    body,
  });

  return {
    number: res.data.number,
    sourceBranch: res.data.head.ref,
    targetBranch: res.data.base.ref,
    title: res.data.title,
    body: res.data.body || "",
  };
}
