export interface ProviderPullRequest {
  hasNextPage: boolean;
  data: { sourceBranch: string; targetBranch: string }[];
}
