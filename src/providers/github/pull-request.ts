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

/** @throws */
async function githubFindUniquePullRequestForCommit(
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

/** @throws */
async function githubFindUniquePullRequestFromBranch(
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

/** @throws */
async function githubCreatePullRequest(
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

/** @throws */
async function githubUpdatePullRequest(
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

/** @throws */
async function githubAddAssigneesToPr(
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

/** @throws */
async function githubAddReviewersToPr(
  octokit: OctokitClient,
  prNumber: string,
  reviewers: string[],
): Promise<void> {
  const userReviewers: string[] = [];
  const teamReviewers: string[] = [];

  for (const req of reviewers) {
    const slashIndex = req.indexOf("/");

    if (slashIndex !== -1) {
      // Extract everything AFTER the first slash
      // e.g., "org/team-slug" -> "team-slug"
      // e.g., "org/wrong/format" -> "wrong/format" (which will safely trigger a 422 API error)
      const slug = req.substring(slashIndex + 1);

      if (slug) {
        teamReviewers.push(slug);
      }
    } else {
      userReviewers.push(req);
    }
  }

  await octokit.rest.pulls.requestReviewers({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    pull_number: Number(prNumber),
    reviewers: userReviewers,
    team_reviewers: teamReviewers,
  });
}

export function makeGithubFindUniquePullRequestForCommit(
  getOctokit: GetOctokitFn,
) {
  return (
    commitHash: string,
    sourceBranch: string,
    targetBranch: string,
    label: string,
  ) =>
    githubFindUniquePullRequestForCommit(
      getOctokit(),
      commitHash,
      sourceBranch,
      targetBranch,
      label,
    );
}

export function makeGithubFindUniquePullRequestFromBranch(
  getOctokit: GetOctokitFn,
) {
  return (
    branchName: string,
    targetBranch: string,
    requiredLabel: string,
  ) =>
    githubFindUniquePullRequestFromBranch(
      getOctokit(),
      branchName,
      targetBranch,
      requiredLabel,
    );
}

export function makeGithubCreatePullRequest(getOctokit: GetOctokitFn) {
  return (
    sourceBranch: string,
    targetBranch: string,
    title: string,
    body: string,
    opts?: { draft?: boolean },
  ) =>
    githubCreatePullRequest(
      getOctokit(),
      sourceBranch,
      targetBranch,
      title,
      body,
      opts,
    );
}

export function makeGithubUpdatePullRequest(getOctokit: GetOctokitFn) {
  return (id: string, title: string, body: string) =>
    githubUpdatePullRequest(getOctokit(), id, title, body);
}

export function makeGithubAddAssigneesToPr(getOctokit: GetOctokitFn) {
  return (proposalId: string, assignees: string[]) =>
    githubAddAssigneesToPr(getOctokit(), proposalId, assignees);
}

export function makeGithubAddReviewersToPr(getOctokit: GetOctokitFn) {
  return (proposalId: string, reviewers: string[]) =>
    githubAddReviewersToPr(getOctokit(), proposalId, reviewers);
}
