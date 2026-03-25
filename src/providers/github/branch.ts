import { RequestError } from "@octokit/request-error";
import { taskLogger } from "../../tasks/logger.ts";
import type { ProviderBranch } from "../../types/providers/branch.ts";
import type { GetOctokitFn, OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";

/** @throws */
async function githubEnsureBranchExist(
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
    if (!(error instanceof RequestError) || error.status !== 404) {
      throw error;
    }

    taskLogger.debug(
      `Branch ${branchName} does not exist. Creating one from commit ${commitHash}...`,
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
    // We check specifically for the 422 "Reference already exists" error.
    if (
      error instanceof RequestError &&
      error.status === 422 &&
      error.message.toLowerCase().includes("reference already exists")
    ) {
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

    // Rethrow any other unexpected errors
    throw error;
  }
}

export function makeGithubEnsureBranchExist(getOctokit: GetOctokitFn) {
  return (branchName: string, commitHash: string) =>
    githubEnsureBranchExist(getOctokit(), branchName, commitHash);
}
