export interface ProviderProposal {
  /** A.K.A. Pull Request number */
  id: string;
  sourceBranch: string;
  targetBranch: string;
  title: string;
  body: string;
}

export interface ProviderAddedAssignees {
  username: string;
}
