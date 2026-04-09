import { RequestError } from "@octokit/request-error";
import { BranchOutOfDateError } from "../../errors/providers/branch.ts";
import { NoCommitFoundError } from "../../errors/providers/commit.ts";
import type { GetOctokitFn, OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type {
  ProviderCommit,
  ProviderCommitDetails,
  ProviderCompareCommits,
} from "../../types/providers/commit.ts";

/** @throws */
async function githubFindCommitsFromGivenToPreviousTagged(
  octokit: OctokitClient,
  commitHash: string,
  stopResolvingCommitAt?: number | string,
): Promise<ProviderCommit[]> {
  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  const tagMap = new Map<string, string>();
  let tagCount = 0;
  const TAG_LIMIT = 500;

  const tagsIterator = octokit.paginate.iterator(
    octokit.rest.repos.listTags,
    {
      owner,
      repo,
      per_page: 100,
    },
  );

  tagsLoop: for await (const response of tagsIterator) {
    for (const tag of response.data) {
      if (!tagMap.has(tag.commit.sha)) {
        tagMap.set(tag.commit.sha, tag.name);
      }

      tagCount++;
      if (tagCount >= TAG_LIMIT) {
        break tagsLoop;
      }
    }
  }

  const collectedCommits: ProviderCommit[] = [];

  const commitsIterator = octokit.paginate.iterator(
    octokit.rest.repos.listCommits,
    {
      owner,
      repo,
      sha: commitHash,
      per_page: 100,
    },
  );

  for await (const response of commitsIterator) {
    for (const commit of response.data) {
      const tagName = tagMap.get(commit.sha);

      if (tagName) {
        if (collectedCommits.length === 0) {
          throw new NoCommitFoundError(
            `No new commits found. The starting commit ${
              commitHash.substring(0, 7)
            } is already tagged (${tagName}).`,
          );
        }
        return collectedCommits;
      }

      collectedCommits.push({
        hash: commit.sha,
        header: commit.commit.message.split("\n")[0] ?? "",
        body: commit.commit.message.split("\n").slice(1).join("\n").trim(),
        message: commit.commit.message,
        treeHash: commit.commit.tree.sha,
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
          commit.sha === stopResolvingCommitAt
        ) {
          return collectedCommits;
        }
      }
    }
  }

  if (collectedCommits.length === 0) {
    throw new NoCommitFoundError(
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
