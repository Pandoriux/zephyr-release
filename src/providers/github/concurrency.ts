import process from "node:process";
import type { OctokitClient } from "./octokit.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";
import { taskLogger } from "../../tasks/logger.ts";
import type { ProviderConcurrencyResult } from "../../types/providers/concurrency.ts";

export async function githubManageConcurrency(
  octokit: OctokitClient,
): Promise<ProviderConcurrencyResult> {
  const owner = githubGetNamespace();
  const repo = githubGetRepositoryName();

  const currentRunIdStr = process.env.GITHUB_RUN_ID ?? "";
  const currentRunId = parseInt(currentRunIdStr, 10);
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

  const currentWfRunCreatedTime = new Date(currentWfRunRes.data.created_at)
    .getTime();
  /////////////////////////////////////

  const paginatedIterator = octokit.paginate.iterator(
    octokit.rest.actions.listWorkflowRuns,
    {
      owner,
      repo,
      workflow_id: currentWfRunRes.data.workflow_id,
      branch: currentWfRunRes.data.head_branch,
      per_page: 100,
    },
  );

  // Hard limit: Stop processing after this many items
  const MAX_HISTORY_DEPTH = 99;

  let hasIncompleteHistory = false;
  let foundLastSuccess = false; // "True" once we hit the first Success run
  let processedCount = 0;

  paginatedLoop: for await (const res of paginatedIterator) {
    for (const wfRun of res.data) {
      // Safety Brake: Stop if we've looked too far back
      if (processedCount >= MAX_HISTORY_DEPTH) {
        break paginatedLoop;
      }

      if (wfRun.id === currentRunId) continue;

      processedCount++;

      const wfRunCreatedTime = new Date(wfRun.created_at).getTime();

      if (wfRunCreatedTime > currentWfRunCreatedTime) {
        return {
          isLatestExecution: false,
          currentExecutionId: currentRunIdStr,
          newerExecutionId: wfRun.id.toString(),
        };
      }

      // If we hit a success, we mark it. Everything AFTER this is just "Cleanup".
      if (wfRun.conclusion === "success" && !foundLastSuccess) {
        foundLastSuccess = true;
      }

      // "Alive" means it's taking up a slot or waiting to run.
      const isAlive = wfRun.status
        ? ["in_progress", "queued", "requested", "waiting", "pending"].includes(
          wfRun.status,
        )
        : false;

      if (isAlive) {
        taskLogger.info(`Workflow run '${wfRun.id}' is older. Cancelling...`);
        await octokit.rest.actions.cancelWorkflowRun({
          owner,
          repo,
          run_id: wfRun.id,
        });

        // Only force a run if this "alive" run was NEWER than the last success.
        // If we found the barrier already, this run is "Ancient History" and irrelevant.
        if (!foundLastSuccess) {
          hasIncompleteHistory = true;
        }

        continue;
      }

      // If it's not alive, check if it failed.
      const isFailed = wfRun.conclusion
        ? ["failure", "cancelled", "timed_out", "action_required"]
          .includes(wfRun.conclusion)
        : false;

      if (isFailed) {
        // Only care if it failed and is NEWER than the last success.
        if (!foundLastSuccess) {
          hasIncompleteHistory = true;
        }
      }
    }
  }

  return {
    isLatestExecution: true,
    currentExecutionId: currentRunIdStr,
    hasIncompleteHistory,
  };
}
