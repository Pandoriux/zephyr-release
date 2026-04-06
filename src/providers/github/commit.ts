import { RequestError } from "@octokit/request-error";
import { BranchOutOfDateError } from "../../errors/providers/branch.ts";
import type { GetOctokitFn, OctokitClient } from "./octokit.ts";
import * as v from "@valibot/valibot";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type {
  ProviderCommit,
  ProviderCommitDetails,
  ProviderCompareCommits,
} from "../../types/providers/commit.ts";

const RawCommitNodeSchema = v.object({
  oid: v.string(),
  messageHeadline: v.string(),
  messageBody: v.string(),
  message: v.string(),
  tree: v.object({
    oid: v.string(),
  }),
  refs: v.object({
    nodes: v.array(
      v.object({
        name: v.string(),
      }),
    ),
  }),
});

/** @throws */
async function githubFindCommitsFromGivenToPreviousTagged(
  octokit: OctokitClient,
  commitHash: string,
  stopResolvingCommitAt?: number | string,
): Promise<ProviderCommit[]> {
  const collectedCommits: ProviderCommit[] = [];

  const paginatedIterator = octokit.graphql.paginate.iterator(
    `
    query getHistory($owner: String!, $repo: String!, $sha: String!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        object(expression: $sha) {
          ... on Commit {
            history(first: 100, after: $cursor, firstParent: true) @paginate {
              nodes {
                oid
                messageHeadline
                messageBody
                message
                tree { oid }
                refs(refPrefix: "refs/tags/", first: 1) {
                  nodes { name }
                }
              }
            }
          }
        }
      }
    }
  `,
    {
      owner: githubGetNamespace(),
      repo: githubGetRepositoryName(),
      sha: commitHash,
    },
  );

  for await (const response of paginatedIterator) {
    const rawNodes = response.repository.object.history.nodes;

    if (!Array.isArray(rawNodes)) {
      throw new Error("Failed to retrieve commit history nodes from GitHub");
    }

    for (const rawNode of rawNodes) {
      const commit = v.parse(RawCommitNodeSchema, rawNode, {
        message: "Received malformed commit data from GitHub GraphQL API",
      });

      const tagName = commit.refs.nodes[0]?.name;

      if (tagName) {
        if (collectedCommits.length === 0) {
          throw new Error(
            `No new commits found. The starting commit ${
              commitHash.substring(0, 7)
            } is already tagged (${tagName}).`,
          );
        }
        return collectedCommits;
      }

      collectedCommits.push({
        hash: commit.oid,
        header: commit.messageHeadline,
        body: commit.messageBody,
        message: commit.message,
        treeHash: commit.tree.oid,
      });

      if (stopResolvingCommitAt) {
        // Check number limit
        if (
          typeof stopResolvingCommitAt === "number" &&
          collectedCommits.length === stopResolvingCommitAt
        ) {
          return collectedCommits;
        }

        // Check hash boundary
        if (
          typeof stopResolvingCommitAt === "string" &&
          commit.oid === stopResolvingCommitAt
        ) {
          return collectedCommits;
        }
      }
    }
  }

  if (collectedCommits.length === 0) {
    throw new Error(
      `No commits found for hash ${commitHash.substring(0, 7)}`,
    );
  }

  return collectedCommits;
}

/** @throws */
async function githubCompareCommits(
  octokit: OctokitClient,
  base: string,
  head: string,
): Promise<ProviderCompareCommits> {
  const res = await octokit.rest.repos.compareCommits({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    base,
    head,
  });

  return {
    commits: res.data.commits.map((c) => ({ message: c.commit.message })),
    totalCommits: res.data.total_commits,
  };
}

/** @throws */
async function githubCreateCommitOnBranch(
  octokit: OctokitClient,
  data: {
    triggerCommitHash: string;
    baseTreeHash: string;
    changesToCommit: Map<string, string | null>;
    message: string;
    targetBranchName: string;
    force?: boolean;
  },
): Promise<ProviderCommit> {
  const {
    triggerCommitHash,
    baseTreeHash,
    changesToCommit,
    message,
    targetBranchName,
    force,
  } = data;

  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  const newTreeItems = Array.from(changesToCommit, ([path, content]) => {
    if (content) {
      return {
        path,
        mode: "100644" as const,
        type: "blob" as const,
        content,
      };
    } else {
      return {
        path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: null,
      };
    }
  });

  const createTreeRes = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeHash,
    tree: newTreeItems,
  });

  // Explicitly linking to "parentSha" ensures the history is exactly what we expect
  const createCommitRes = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: createTreeRes.data.sha,
    parents: [triggerCommitHash],
  });

  // If true (in review mode), we are effectively "overwriting" the branch history with this new timeline
  // If false (in auto mode), throws error if there are newer commits
  try {
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${targetBranchName}`,
      sha: createCommitRes.data.sha,
      force,
    });
  } catch (error) {
    if (
      error instanceof RequestError &&
      error.status === 422 &&
      error.message.toLowerCase().includes("is not a fast forward")
    ) {
      throw new BranchOutOfDateError();
    }

    throw error;
  }

  return {
    hash: createCommitRes.data.sha,
    header: message.split("\n")[0] ?? "",
    body: message.split("\n").slice(1).join("\n").trim(),
    message,
    treeHash: createTreeRes.data.sha,
  };
}

/** @throws */
async function githubGetCommit(
  octokit: OctokitClient,
  hash: string,
): Promise<ProviderCommitDetails> {
  const res = await octokit.rest.git.getCommit({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    commit_sha: hash,
  });

  return {
    hash: res.data.sha,
    header: res.data.message.split("\n")[0] ?? "",
    body: res.data.message.split("\n").slice(1).join("\n").trim(),
    message: res.data.message,
    treeHash: res.data.tree.sha,

    author: {
      name: res.data.author.name,
      email: res.data.author.email,
      date: new Date(res.data.author.date),
    },
    committer: {
      name: res.data.committer.name,
      email: res.data.committer.email,
      date: new Date(res.data.committer.date),
    },
  };
}

export function makeGithubFindCommitsFromGivenToPreviousTagged(
  getOctokit: GetOctokitFn,
) {
  return (
    commitHash: string,
    stopResolvingCommitAt?: number | string,
  ) =>
    githubFindCommitsFromGivenToPreviousTagged(
      getOctokit(),
      commitHash,
      stopResolvingCommitAt,
    );
}

export function makeGithubCompareCommits(getOctokit: GetOctokitFn) {
  return (base: string, head: string) =>
    githubCompareCommits(getOctokit(), base, head);
}

export function makeGithubCreateCommitOnBranch(
  getOctokit: GetOctokitFn,
) {
  return (
    triggerCommitHash: string,
    baseTreeHash: string,
    changesToCommit: Map<string, string | null>,
    message: string,
    targetBranchName: string,
    force?: boolean,
  ) =>
    githubCreateCommitOnBranch(getOctokit(), {
      triggerCommitHash,
      baseTreeHash,
      changesToCommit,
      message,
      targetBranchName,
      force,
    });
}

export function makeGithubGetCommit(getOctokit: GetOctokitFn) {
  return (hash: string) => githubGetCommit(getOctokit(), hash);
}
