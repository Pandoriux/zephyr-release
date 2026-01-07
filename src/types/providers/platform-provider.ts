import type { CoreLogger } from "../logger.ts";
import type { ProviderInputs } from "./inputs.ts";
import type { ProviderPullRequest } from "./pull-request.ts";

export interface PlatformProvider {
  platform: "github" | ""; // gitlab? local?

  logger: CoreLogger;

  getNamespace: () => string;
  getRepositoryName: () => string;

  getInputs: () => ProviderInputs;

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

  getTextFileOrThrow: (
    workspacePath: string,
    filePath: string,
  ) => Promise<string>;

  exportVariables: (exportObj: Record<string, unknown>) => void;

  // more
}
