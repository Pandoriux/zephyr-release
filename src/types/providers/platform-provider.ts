import type { CoreLogger } from "../logger.ts";
import type { ProviderBranch } from "./branch.ts";
import type { ProviderCommit } from "./commit.ts";
import type { ProviderInputs } from "./inputs.ts";
import type { ProviderPullRequest } from "./pull-request.ts";

export interface PlatformProvider {
  platform: "github" | ""; // gitlab? local?

  logger: CoreLogger;

  getInputs: () => ProviderInputs;

  getNamespace: () => string;
  getRepositoryName: () => string;

  getTextFileOrThrow: (
    workspacePath: string,
    filePath: string,
  ) => Promise<string>;

  ensureBranchAtCommitOrThrow: (
    token: string,
    branchName: string,
    commitHash: string,
  ) => Promise<ProviderBranch>;

  findCommitsFromGivenToPreviousTaggedOrThrow: (
    token: string,
    commitHash: string,
  ) => Promise<ProviderCommit[]>;

  findUniquePullRequestForCommitOrThrow: (
    token: string,
    commitHash: string,
    sourceBranch: string,
    label: string,
  ) => Promise<ProviderPullRequest | undefined>;

  findUniquePullRequestFromBranchOrThrow: (
    token: string,
    branchName: string,
    requiredLabel: string,
  ) => Promise<ProviderPullRequest | undefined>;

  exportVariables: (exportObj: Record<string, unknown>) => void;

  // more
}
