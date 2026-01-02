import type { CoreLogger } from "../logger.ts";
import type { ProviderInputs } from "./inputs.ts";
import { ProviderPullRequest } from "./pull-request.ts";

export interface PlatformProvider {
  platform: "github" | ""; // gitlab? local?

  logger: CoreLogger;

  getInputs: () => ProviderInputs;

  getPullRequestsForCommit: (
    commitHash: string,
    token: string,
  ) => Promise<ProviderPullRequest[]>;

  getTextFileOrThrow: (
    workspacePath: string,
    filePath: string,
  ) => Promise<string>;

  // more
}
