import type { GetOctokitFn, OctokitClient } from "./octokit.ts";
import * as v from "@valibot/valibot";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type {
  ProviderAddedAssignees,
  ProviderProposal,
} from "../../types/providers/proposal.ts";
import { taskLogger } from "../../tasks/logger.ts";

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

async function githubFindUniquePullRequestForCommitOrThrow(
  octokit: OctokitClient,
  commitHash: string,
  sourceBranch: string,
  targetBranch: string,
  requiredLabel: string,
): Promise<ProviderProposal | undefined> {
  let foundPr: ProviderProposal | undefined = undefined;

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
          id: String(pr.number),
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

async function githubFindUniquePullRequestFromBranchOrThrow(
  octokit: OctokitClient,
  branchName: string,
  targetBranch: string,
  requiredLabel: string,
): Promise<ProviderProposal | undefined> {
  let foundPr: ProviderProposal | undefined = undefined;

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
          id: String(pr.number),
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

async function githubCreatePullRequestOrThrow(
  octokit: OctokitClient,
  sourceBranch: string,
  targetBranch: string,
  title: string,
  body: string,
  opts?: { draft?: boolean },
): Promise<ProviderProposal> {
  const { draft } = opts ?? {};

  const res = await octokit.rest.pulls.create({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    head: sourceBranch,
    base: targetBranch,
    title,
    body,
    draft,
  });

  return {
    id: String(res.data.number),
    sourceBranch: res.data.head.ref,
    targetBranch: res.data.base.ref,
    title: res.data.title,
    body: res.data.body || "",
  };
}

async function githubUpdatePullRequestOrThrow(
  octokit: OctokitClient,
  prNumber: string,
  title: string,
  body: string,
): Promise<ProviderProposal> {
  const res = await octokit.rest.pulls.update({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    pull_number: Number(prNumber),
    title,
    body,
  });

  return {
    id: String(res.data.number),
    sourceBranch: res.data.head.ref,
    targetBranch: res.data.base.ref,
    title: res.data.title,
    body: res.data.body || "",
  };
}

async function githubAddAssigneesToPrOrThrow(
  octokit: OctokitClient,
  prNumber: string,
  assignees: string[],
): Promise<ProviderAddedAssignees[]> {
  let assigneesToAdd = assignees;

  if (assignees.length > 10) {
    assigneesToAdd = assignees.slice(0, 10);
    taskLogger.info(
      "GitHub limits PRs to 10 assignees. Truncated the requested list",
    );
  }

  const res = await octokit.rest.issues.addAssignees({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    issue_number: Number(prNumber),
    assignees: assigneesToAdd,
  });

  return res.data.assignees?.map((assignee) => ({
    username: assignee.login,
  })) ?? [];
}

async function githubAddReviewersToPrOrThrow(
  octokit: OctokitClient,
  prNumber: string,
  reviewers: string[],
): Promise<void> {
  // TODO: implement logic
  return;
}

export function makeGithubFindUniquePullRequestForCommitOrThrow(
  getOctokit: GetOctokitFn,
) {
  return (
    commitHash: string,
    sourceBranch: string,
    targetBranch: string,
    label: string,
  ) =>
    githubFindUniquePullRequestForCommitOrThrow(
      getOctokit(),
      commitHash,
      sourceBranch,
      targetBranch,
      label,
    );
}

export function makeGithubFindUniquePullRequestFromBranchOrThrow(
  getOctokit: GetOctokitFn,
) {
  return (
    branchName: string,
    targetBranch: string,
    requiredLabel: string,
  ) =>
    githubFindUniquePullRequestFromBranchOrThrow(
      getOctokit(),
      branchName,
      targetBranch,
      requiredLabel,
    );
}

export function makeGithubCreatePullRequestOrThrow(getOctokit: GetOctokitFn) {
  return (
    sourceBranch: string,
    targetBranch: string,
    title: string,
    body: string,
    opts?: { draft?: boolean },
  ) =>
    githubCreatePullRequestOrThrow(
      getOctokit(),
      sourceBranch,
      targetBranch,
      title,
      body,
      opts,
    );
}

export function makeGithubUpdatePullRequestOrThrow(getOctokit: GetOctokitFn) {
  return (id: string, title: string, body: string) =>
    githubUpdatePullRequestOrThrow(getOctokit(), id, title, body);
}

export function makeGithubAddAssigneesToPrOrThrow(getOctokit: GetOctokitFn) {
  return (proposalId: string, assignees: string[]) =>
    githubAddAssigneesToPrOrThrow(getOctokit(), proposalId, assignees);
}

export function makeGithubAddReviewersToPrOrThrow(getOctokit: GetOctokitFn) {
  return (proposalId: string, reviewers: string[]) =>
    githubAddReviewersToPrOrThrow(getOctokit(), proposalId, reviewers);
}
