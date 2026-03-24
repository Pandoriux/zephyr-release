export interface ProviderCommit {
  hash: string;
  header: string;
  body: string;

  /**
   * Full commit message (header + body)
   */
  message: string;

  /**
   * Tree hash associated with this commit.
   */
  treeHash: string;
}

export interface ProviderCommitDetails extends ProviderCommit {
  author: { name: string; email: string; date: Date };
  committer: { name: string; email: string; date: Date };
}

export interface ProviderCompareCommits {
  commits: { message: string }[];
  totalCommits: number;
}
