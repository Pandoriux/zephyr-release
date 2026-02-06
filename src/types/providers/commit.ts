export interface ProviderCommit {
  hash: string;
  header: string;
  body: string;

  /**
   * Full commit message (header + body)
   */
  message: string;
}

export interface ProviderWorkingCommit {
  workingCommitHash: string;
  workingTreeHash: string;
}
