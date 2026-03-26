import * as v from "@valibot/valibot";
import type { GetOctokitFn, OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import { RequestError } from "@octokit/request-error";
import { taskLogger } from "../../tasks/logger.ts";
import type {
  ProviderInputLabel,
  ProviderLabel,
} from "../../types/providers/label.ts";
import { pooledMap } from "@std/async";
import { consumeAsyncIterable } from "../../utils/async.ts";

/** @throws */
async function githubAddLabelsToPullRequest(
  octokit: OctokitClient,
  prNumber: string,
  labels: ProviderInputLabel[],
): Promise<ProviderLabel[]> {
  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  try {
    const res = await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: Number(prNumber),
      labels: labels.map((l) => l.name),
    });

    return res.data.map((l) => ({
      name: l.name,
      color: l.color,
      description: l.description ?? undefined,
    }));
  } catch (error) {
    if (!(error instanceof RequestError) || error.status !== 422) {
      // Other errors...
      throw error;
    }

    taskLogger.debug(
      "Failed to add labels (status 422). Ensuring labels exist and retrying...",
    );

    const existingLabelNames = await githubGetAllLabelNames(octokit);
    const labelsToAdd: string[] = [];

    for (const label of labels) {
      if (existingLabelNames.has(label.name)) {
        labelsToAdd.push(label.name);
        continue;
      }

      if (label.createIfMissing) {
        const ghColor = label.color.startsWith("#")
          ? label.color.slice(1)
          : label.color;

        try {
          await octokit.rest.issues
            .createLabel({
              owner,
              repo,
              name: label.name,
              color: ghColor,
              description: label.description,
            });

          labelsToAdd.push(label.name);
        } catch (error) {
          taskLogger.debug(
            `Failed to create label ${label.name}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    if (labelsToAdd.length === 0) {
      return [];
    }

    const finalResponse = await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: Number(prNumber),
      labels: labelsToAdd,
    });

    return finalResponse.data.map((l) => ({
      name: l.name,
      color: l.color,
      description: l.description ?? undefined,
    }));
  }
}

const RawLabelsPageSchema = v.object({
  repository: v.object({
    labels: v.object({
      nodes: v.array(v.object({
        name: v.string(),
      })),
      pageInfo: v.object({
        hasNextPage: v.boolean(),
        endCursor: v.string(),
      }),
    }),
  }),
});

/** @throws */
async function githubGetAllLabelNames(
  octokit: OctokitClient,
): Promise<Set<string>> {
  const labelNames = new Set<string>();

  const paginatedIterator = octokit.graphql.paginate.iterator(
    `
    query getAllLabels($owner: String!, $repo: String!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        labels(first: 100, after: $cursor) @paginate {
          nodes {
            name
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
      owner: githubGetNamespace(),
      repo: githubGetRepositoryName(),
    },
  );

  for await (const response of paginatedIterator) {
    const rawResponse = v.parse(RawLabelsPageSchema, response, {
      message: "Received malformed label data from GitHub GraphQL API",
    });

    for (const node of rawResponse.repository.labels.nodes) {
      labelNames.add(node.name);
    }
  }

  return labelNames;
}

/** @throws */
async function githubRemoveLabelsFromPullRequest(
  octokit: OctokitClient,
  prNumber: string,
  labels: string[],
): Promise<string[]> {
  const removedLabels: string[] = [];

  await consumeAsyncIterable(
    pooledMap(5, labels, async (label) => {
      try {
        await octokit.rest.issues.removeLabel({
          owner: githubGetNamespace(),
          repo: githubGetRepositoryName(),
          issue_number: Number(prNumber),
          name: label,
        });

        removedLabels.push(label);
      } catch (error) {
        if (error instanceof RequestError && error.status === 404) {
          removedLabels.push(label);
          return;
        }

        const successList = removedLabels.length > 0
          ? removedLabels.join(", ")
          : "none";

        throw new Error(
          `Failed to remove label "${label}" from PR #${prNumber}. ` +
            `Successfully removed so far: [${successList}]. ` +
            `GitHub API responded with: ${
              error instanceof Error ? error.message : String(error)
            }`,
          { cause: error },
        );
      }
    }),
  );

  return removedLabels;
}

export function makeGithubAddLabelsToPullRequest(
  getOctokit: GetOctokitFn,
) {
  return (proposalId: string, labels: ProviderInputLabel[]) =>
    githubAddLabelsToPullRequest(getOctokit(), proposalId, labels);
}

export function makeGithubRemoveLabelsFromPullRequest(
  getOctokit: GetOctokitFn,
) {
  return (proposalId: string, labels: string[]) =>
    githubRemoveLabelsFromPullRequest(getOctokit(), proposalId, labels);
}
