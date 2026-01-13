import { getOctokitClient } from "./octokit.ts";
import * as v from "@valibot/valibot";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import type { ProviderCommit } from "../../types/providers/commit.ts";

const RawCommitNodeSchema = v.object({
  oid: v.string(),
  messageHeadline: v.string(),
  messageBody: v.string(),
  message: v.string(),
  refs: v.object({
    nodes: v.array(
      v.object({
        name: v.string(),
      }),
    ),
  }),
});

export async function githubFindCommitsFromGivenToPreviousTaggedOrThrow(
  token: string,
  commitHash: string,
): Promise<ProviderCommit[]> {
  const collectedCommits: ProviderCommit[] = [];
  const octokit = getOctokitClient(token);

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
      });
    }
  }

  if (collectedCommits.length === 0) {
    throw new Error(
      `No commits found for hash ${commitHash.substring(0, 7)}`,
    );
  }

  return collectedCommits;
}
