import process from "node:process";
import type { OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import { taskLogger } from "../../tasks/logger.ts";

export async function githubManageConcurrency(
  octokit: OctokitClient,
): Promise<void> {
  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  const currentRunId = parseInt(process.env.GITHUB_RUN_ID ?? "", 10);
  if (isNaN(currentRunId)) {
    throw new Error("Current 'GITHUB_RUN_ID' is invalid");
  }

  const currentWfRunRes = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: currentRunId,
  });

  if (!currentWfRunRes.data.head_branch) {
    throw new Error(
      "Current workflow run has no associated branch (head_branch is null)",
    );
  }

  const paginatedIterator = octokit.paginate.iterator(
    octokit.rest.actions.listWorkflowRuns,
    {
      owner,
      repo,
      workflow_id: currentWfRunRes.data.workflow_id,
      branch: currentWfRunRes.data.head_branch,
      status: "in_progress",
      per_page: 100,
    },
  );

  const currentWfRunCreatedTime = new Date(currentWfRunRes.data.created_at)
    .getTime();

  for await (const res of paginatedIterator) {
    for (const wfRun of res.data) {
      if (wfRun.id === currentRunId) continue;

      const wfRunCreatedTime = new Date(wfRun.created_at).getTime();

      if (wfRunCreatedTime < currentWfRunCreatedTime) {
        taskLogger.info(`Workflow run '${wfRun.id}' is older. Cancelling...`);

        await octokit.rest.actions.cancelWorkflowRun({
          owner,
          repo,
          run_id: wfRun.id,
        });
      } else {
        throw new Error(
          `Workflow run '${wfRun.id}' is newer than current run (${currentRunId}). This instance is obsolete.`,
        );
      }
    }
  }
}
