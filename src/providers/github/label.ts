import * as v from "@valibot/valibot";
import type { OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import { isGitHubErrorResponse } from "./utils/error-validations.ts";
import { taskLogger } from "../../tasks/logger.ts";
import type { ProviderLabel } from "../../types/providers/label.ts";

export async function githubAddLabelsToPullRequestOrThrow(
  octokit: OctokitClient,
  prNumber: number,
  requiredLabels: ProviderLabel[],
  optionalLabels?: string[],
) {
  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  try {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: prNumber,
      labels: [...requiredLabels.map((l) => l.name), ...(optionalLabels ?? [])],
    });
  } catch (error) {
    if (!isGitHubErrorResponse(error) || error.status !== 422) {
      // Other errors...
      throw error;
    }

    // Labels might be missing
    taskLogger.debug(
      "Failed to add labels (status 422). Ensuring labels exist and retrying once...",
    );

    // Last attempt
    const existingLabelNames = await _githubGetAllLabelNames(octokit);
    const newLabelsToAdd = [...existingLabelNames];

    for (const label of requiredLabels) {
      if (existingLabelNames.has(label.name)) continue;

      const ghColor = label.color?.startsWith("#")
        ? label.color.slice(1)
        : label.color;

      await octokit.rest.issues.createLabel({
        owner,
        repo,
        name: label.name,
        color: ghColor,
        description: label.description,
      });

      newLabelsToAdd.push(label.name);
    }

    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: prNumber,
      labels: newLabelsToAdd,
    });
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

async function _githubGetAllLabelNames(
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
