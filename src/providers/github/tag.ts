import { canParse, compare, parse } from "@std/semver";
import {
  githubGetHost,
  githubGetNamespace,
  githubGetRepositoryName,
} from "./repository.ts";
import type { OctokitClient } from "./octokit.ts";
import { isGitHubErrorResponse } from "./utils/error-validations.ts";
import { joinUrlSegments } from "../../utils/transformers/url.ts";

export function githubGetCompareTagUrl(tag1: string, tag2: string): string {
  let compareSegment = tag1 + "..." + tag2;

  if (canParse(tag1) && canParse(tag2)) {
    const cmp = compare(parse(tag1), parse(tag2));

    if (cmp === 1) {
      compareSegment = tag2 + "..." + tag1;
    }
  }

  return new URL(
    joinUrlSegments(
      githubGetNamespace(),
      githubGetRepositoryName(),
      "compare",
      compareSegment,
    ),
    githubGetHost(),
  ).href;
}

export async function githubGetCompareTagUrlFromCurrentToLatest(
  octokit: OctokitClient,
  currentTag: string,
  skip: number = 0,
): Promise<string> {
  if (skip < 0) {
    throw new Error(`Skip value cannot be a negative number: ${skip}`);
  }

  const paginatedIterator = octokit.paginate.iterator(
    octokit.rest.repos.listTags,
    {
      owner: githubGetNamespace(),
      repo: githubGetRepositoryName(),
      per_page: skip + 1 < 100 ? skip + 1 : 100,
    },
  );

  const tags: string[] = [];

  for await (const res of paginatedIterator) {
    for (const tag of res.data) {
      tags.push(tag.name);

      // Stop as soon as we have enough tags to satisfy the skip
      if (tags.length > skip) break;
    }
    if (tags.length > skip) break;
  }

  const targetTag = tags[skip];
  if (!targetTag) {
    throw new Error(
      `Cannot skip ${skip} tag(s) from latest; repository only contains ${tags.length} tag(s) total`,
    );
  }

  return new URL(
    joinUrlSegments(
      githubGetNamespace(),
      githubGetRepositoryName(),
      "compare",
      targetTag + "..." + currentTag,
    ),
    githubGetHost(),
  ).href;
}

export async function githubGetLatestReleaseTagOrThrow(
  octokit: OctokitClient,
): Promise<string | undefined> {
  try {
    const res = await octokit.rest.repos.getLatestRelease({
      owner: githubGetNamespace(),
      repo: githubGetRepositoryName(),
    });

    return res.data.tag_name;
  } catch (error) {
    if (isGitHubErrorResponse(error) && error.status === 404) {
      // No releases found
      return undefined;
    }

    throw error;
  }
}
