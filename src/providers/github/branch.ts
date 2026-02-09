import { taskLogger } from "../../tasks/logger.ts";
import type { ProviderBranch } from "../../types/providers/branch.ts";
import type { OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";

export async function githubEnsureBranchExistOrThrow(
  octokit: OctokitClient,
  branchName: string,
  commitHash: string,
): Promise<ProviderBranch> {
  const refForGet = `heads/${branchName}`;
  const refForCreate = `refs/${refForGet}`;

  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  try {
    const existingRefRes = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: refForGet,
    });

    return existingRefRes.data;
  } catch (error) {
    // If the ref is missing (404), fall through and create it. Otherwise rethrow.
    if (!isGitHubBranchNotFoundError(error)) {
      throw error;
    }

    taskLogger.debug(
      `Branch ${branchName} does not exist. Creating at ${commitHash}...`,
    );
  }

  try {
    const createRefRes = await octokit.rest.git.createRef({
      owner,
      repo,
      ref: refForCreate,
      sha: commitHash,
    });

    return createRefRes.data;
  } catch (error) {
    // In a race, the branch may have been created after our initial getRef call.
    // If we now see "already exists", fetch and return the existing ref.
    if (isGitHubBranchAlreadyExistsError(error)) {
      taskLogger.debug(
        `Branch ${branchName} was created concurrently. Fetching existing reference...`,
      );

      const existingRefRes = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: refForGet,
      });

      return existingRefRes.data;
    }

    throw error;
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

function isGitHubBranchNotFoundError(error: unknown): boolean {
  return typeof error === "object" && error !== null &&
    "status" in error && typeof error.status === "number" &&
    error.status === 404;
}
