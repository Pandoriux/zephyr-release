import { taskLogger } from "../../tasks/logger.ts";
import type { ProviderBranch } from "../../types/providers/branch.ts";
import { getOctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";

export async function githubEnsureBranchAtCommitOrThrow(
  token: string,
  branchName: string,
  commitHash: string,
): Promise<ProviderBranch> {
  const refForUpdate = `heads/${branchName}`;
  const refForCreate = `refs/${refForUpdate}`;

  const octokit = getOctokitClient(token);
  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  try {
    const createRefRes = await octokit.rest.git.createRef({
      owner,
      repo,
      ref: refForCreate,
      sha: commitHash,
    });

    return createRefRes.data;
  } catch (error) {
    // If it already exists (422), force update it instead
    if (isGitHubBranchAlreadyExistsError(error)) {
      taskLogger.debug(
        `Branch ${branchName} exists. Force-resetting to ${commitHash}...`,
      );

      const updateRefRes = await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: refForUpdate,
        sha: commitHash,
        force: true,
      });

      return updateRefRes.data;
    } else {
      throw error;
    }
  }
}

// Helper made by AI, might need verification
function isGitHubBranchAlreadyExistsError(error: unknown): boolean {
  // Validate error is an object
  if (typeof error !== "object" || error === null) {
    return false;
  }

  // Validate status property exists and is 422
  if (
    !("status" in error) || typeof error.status !== "number" ||
    error.status !== 422
  ) {
    return false;
  }

  // Validate response property exists and is an object
  if (
    !("response" in error) || typeof error.response !== "object" ||
    error.response === null
  ) {
    return false;
  }

  // Validate response.data property exists and is an object
  if (
    !("data" in error.response) || typeof error.response.data !== "object" ||
    error.response.data === null
  ) {
    return false;
  }

  // Validate response.data.message property exists and is a string
  if (
    !("message" in error.response.data) ||
    typeof error.response.data.message !== "string"
  ) {
    return false;
  }

  // Check if message indicates reference already exists
  // GitHub API returns messages like "Reference already exists" or "Reference refs/heads/... already exists"
  const message = error.response.data.message.toLowerCase();
  return message.includes("reference") && message.includes("already exists");
}
