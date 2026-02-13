import process from "node:process";
import fs from "node:fs";
import type { ProviderOperationTriggerContext } from "../../types/operation-context.ts";

export function githubGetOperationTriggerContextOrThrow(): ProviderOperationTriggerContext {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    throw new Error("GITHUB_EVENT_PATH not found");
  }

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  if (!isGitHubPushEvent(eventPayload)) {
    throw new Error("Cannot parse current event payload");
  }

  const { head_commit, commits } = eventPayload;
  return {
    latestTriggerCommit: head_commit
      ? {
        hash: head_commit.id,
        treeHash: head_commit.tree_id,
        message: head_commit.message,
      }
      : null,

    triggerCommits: commits.map((event) => ({
      hash: event.id,
      treeHash: event.tree_id,
      message: event.message,
    })),
  };
}

interface GitHubPushEvent {
  head_commit: {
    id: string;
    tree_id: string;
    message: string;
  } | null;
  commits: {
    id: string;
    tree_id: string;
    message: string;
  }[];
}

function isGitHubPushEvent(event: unknown): event is GitHubPushEvent {
  // 1. Must be an object and not null
  if (typeof event !== "object" || event === null) {
    return false;
  }

  // 2. Validate 'head_commit' (it can be missing, null, or an object)
  if ("head_commit" in event && event.head_commit !== null) {
    const head = event.head_commit;

    // We must check if 'head' is an object because 'in' only works on objects
    if (typeof head !== "object") return false;

    if (
      !("id" in head) || typeof head.id !== "string" ||
      !("tree_id" in head) || typeof head.tree_id !== "string" ||
      !("message" in head) || typeof head.message !== "string"
    ) {
      return false;
    }
  }

  // 3. Validate 'commits' property exists and is an array
  if (!("commits" in event) || !Array.isArray(event.commits)) {
    return false;
  }

  // 4. Validate every item in the 'commits' array
  for (const commit of event.commits) {
    if (typeof commit !== "object" || commit === null) return false;

    if (
      !("id" in commit) || typeof commit.id !== "string" ||
      !("tree_id" in commit) || typeof commit.tree_id !== "string" ||
      !("message" in commit) || typeof commit.message !== "string"
    ) {
      return false;
    }
  }

  return true;
}
