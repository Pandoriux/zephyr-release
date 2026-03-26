import type { GetOctokitFn, OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type {
  ProviderAddedAssignees,
  ProviderProposal,
} from "../../types/providers/proposal.ts";
import { taskLogger } from "../../tasks/logger.ts";
import { RequestError } from "@octokit/request-error";

/** @throws */
async function githubFindMergedProposalPrByCommit(
  octokit: OctokitClient,
  commitHash: string,
  sourceBranch: string,
  targetBranch: string,
): Promise<ProviderProposal | undefined> {
  try {
    const paginatedIterator = octokit.paginate.iterator(
      octokit.rest.repos.listPullRequestsAssociatedWithCommit,
      {
        owner: githubGetNamespace(),
        repo: githubGetRepositoryName(),
        commit_sha: commitHash,
        per_page: 100,
      },
    );

    for await (const response of paginatedIterator) {
      for (const pr of response.data) {
        if (
          pr.head.ref === sourceBranch &&
          pr.base.ref === targetBranch &&
          pr.merged_at !== null
        ) {
          // We found the exact match!
          // Returning here instantly stops the iterator and cancels future API requests.
          return {
            id: String(pr.number),
            sourceBranch: pr.head.ref,
            targetBranch: pr.base.ref,
            title: pr.title,
            body: pr.body || "",
          };
        }
      }
    }

    // If the loop exhausts all pages and finishes, no matching PR exists
    return undefined;
  } catch (error) {
    if (error instanceof RequestError && error.status === 404) {
      return undefined;
    }

    throw new Error(
      `Failed to fetch associated PRs for commit ${
        commitHash.substring(0, 7)
      }. GitHub API responded with: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
}

/** @throws */
async function githubFindOpenProposalPr(
  octokit: OctokitClient,
  sourceBranch: string,
  targetBranch: string,
): Promise<ProviderProposal | undefined> {
  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  try {
    const res = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "open", // We only care about active proposals
      head: `${owner}:${sourceBranch}`, // Server-side filter for sourceBranch
      base: targetBranch, // Server-side filter for targetBranch
      per_page: 2, // Fetch 2 just to be safe, but we only expect 1
    });

    if (!res.data[0]) {
      return undefined;
    }

    // Defensive check: This should be mathematically impossible on GitHub,
    // but if the API ever misbehaves, we catch it before it does damage.
    if (res.data.length > 1) {
      throw new Error(
        `Multiple open PRs found for branch '${sourceBranch}' targeting '${targetBranch}'. GitHub should not allow this state.`,
      );
    }

    const pr = res.data[0];

    return {
      id: String(pr.number),
      sourceBranch: pr.head.ref,
      targetBranch: pr.base.ref,
      title: pr.title,
      body: pr.body || "",
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch open PRs for branch '${sourceBranch}'. GitHub API responded with: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
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

export function makeGithubFindMergedProposalPrByCommit(
  getOctokit: GetOctokitFn,
) {
  return (commitHash: string, sourceBranch: string, targetBranch: string) =>
    githubFindMergedProposalPrByCommit(
      getOctokit(),
      commitHash,
      sourceBranch,
      targetBranch,
    );
}

export function makeGithubFindOpenProposalPr(
  getOctokit: GetOctokitFn,
) {
  return (sourceBranch: string, targetBranch: string) =>
    githubFindOpenProposalPr(getOctokit(), sourceBranch, targetBranch);
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
