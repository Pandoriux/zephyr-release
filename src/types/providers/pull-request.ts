export interface ProviderPaginatedPullRequest {
  hasNextPage: boolean;
  data: ProviderPullRequest[];
}

export interface ProviderPullRequest {
  sourceBranch: string;
  targetBranch: string;
}
