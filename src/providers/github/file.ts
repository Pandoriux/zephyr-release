import { Buffer } from "node:buffer";
import type { OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";

export async function githubGetTextFileOrThrow(
  octokit: OctokitClient,
  filePath: string,
  ref?: string,
): Promise<string> {
  const res = await octokit.rest.repos.getContent({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),
    path: filePath,
    ref,
  });

  const data = res.data;

  if (Array.isArray(data)) {
    throw new Error(`Path '${filePath}' is a directory, not a file.`);
  }

  if (data.type !== "file") {
    throw new Error(
      `Path '${filePath}' is not a standard file (type: ${data.type}).`,
    );
  }

  if (!data.content) {
    throw new Error(
      `File '${filePath}' has no content, it might be too large (GitHub API limits to 1MB). Your file should not be that ` +
        "large... right?",
    );
  }

  return Buffer.from(data.content, "base64").toString("utf-8");
}
