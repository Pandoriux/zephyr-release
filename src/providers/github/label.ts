import * as v from "@valibot/valibot";
import type { GetOctokitFn, OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import { isGitHubErrorResponse } from "./utils/error-validations.ts";
import { taskLogger } from "../../tasks/logger.ts";
import type { ProviderLabelOptions } from "../../types/providers/label.ts";

async function githubAddLabelsToPullRequestOrThrow(
  octokit: OctokitClient,
  prNumber: number,
  labelOptions: ProviderLabelOptions,
) {
  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  if (labelOptions.labels.length === 0) {
    return;
  }

  if (labelOptions.createIfMissing === false) {
    const initialLabels = labelOptions.labels;

    try {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: initialLabels,
      });
    } catch (error) {
      if (!isGitHubErrorResponse(error) || error.status !== 422) {
        // Other errors...
        throw error;
      }

      // Labels might be missing: fall back to only existing labels
      taskLogger.debug(
        "Failed to add labels (status 422). Retrying with only existing labels...",
      );

      const existingLabelNames = await githubGetAllLabelNames(octokit);
      const labelsToAdd = initialLabels.filter((name: string) =>
        existingLabelNames.has(name)
      );

      if (labelsToAdd.length === 0) {
        return;
      }

      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: labelsToAdd,
      });
    }
  } else {
    const requiredLabels = labelOptions.labels;

    try {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: requiredLabels.map((l) => l.name),
      });
    } catch (error) {
      if (!isGitHubErrorResponse(error) || error.status !== 422) {
        // Other errors...
        throw error;
      }

      // Labels might be missing: ensure they exist then retry once
      taskLogger.debug(
        "Failed to add labels (status 422). Ensuring labels exist and retrying once...",
      );

      const existingLabelNames = await githubGetAllLabelNames(octokit);
      const labelsToAdd: string[] = [];

      for (const label of requiredLabels) {
        if (existingLabelNames.has(label.name)) {
          labelsToAdd.push(label.name);
          continue;
        }

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

        labelsToAdd.push(label.name);
      }

      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: labelsToAdd,
      });
    }
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

async function githubRemoveLabelFromPullRequestOrThrow(
  octokit: OctokitClient,
  prNumber: number,
  label: string,
) {
  await octokit.rest.issues.removeLabel({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    issue_number: prNumber,
    name: label,
  });
}

export function makeGithubAddLabelsToPullRequestOrThrow(
  getOctokit: GetOctokitFn,
) {
  return (prNumber: number, labelOptions: ProviderLabelOptions) =>
    githubAddLabelsToPullRequestOrThrow(getOctokit(), prNumber, labelOptions);
}

export function makeGithubRemoveLabelFromPullRequestOrThrow(
  getOctokit: GetOctokitFn,
) {
  return (prNumber: number, label: string) =>
    githubRemoveLabelFromPullRequestOrThrow(getOctokit(), prNumber, label);
}
