import type { CoreLogger } from "../logger.ts";
import type { ProviderInputs } from "./inputs.ts";
import type { ProviderPullRequest } from "./pull-request.ts";

export interface PlatformProvider {
  platform: "github" | ""; // gitlab? local?

  logger: CoreLogger;

  getNamespace: () => string;
  getRepositoryName: () => string;

  getInputs: () => ProviderInputs;

  getPullRequestsForCommitOrThrow: (
    token: string,
    commitHash: string,
    sourceBranch: string,
    label: string,
  ) => Promise<ProviderPullRequest>;

  getTextFileOrThrow: (
    workspacePath: string,
    filePath: string,
  ) => Promise<string>;

  // more
}
