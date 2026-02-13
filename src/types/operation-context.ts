import type { Commit } from "conventional-commits-parser";

export interface ProviderOperationTriggerContext {
  latestTriggerCommit: {
    hash: string;
    treeHash: string;
    message: string;
  } | null;

  // When a push contains multiple commits
  triggerCommits: {
    hash: string;
    treeHash: string;
    message: string;
  }[];
}

export interface OperationTriggerContext {
  latestTriggerCommit: { commit: Commit; treeHash: string };
  triggerCommits: Commit[];
}
