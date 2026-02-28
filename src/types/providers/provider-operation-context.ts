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
