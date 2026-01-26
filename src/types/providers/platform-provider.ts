import type { ParserOptions } from "conventional-commits-parser";
import type { CoreLogger } from "../logger.ts";
import type { ProviderBranch } from "./branch.ts";
import type { ProviderCommit } from "./commit.ts";
import type { ProviderInputs } from "./inputs.ts";
import type { ProviderPullRequest } from "./pull-request.ts";

export interface PlatformProvider {
  platform: "github" | ""; // gitlab? local?

  logger: CoreLogger;

  getInputs: () => ProviderInputs;

  getHost: () => string;
  getNamespace: () => string;
  getRepositoryName: () => string;
  getCommitPathPart: () => string;
  getReferencePathPart: () => string;

  getCompareTagUrl: (tag1: string, tag2: string) => string;
  getCompareTagUrlFromCurrentToLatest: (
    token: string,
    currentTag: string,
    skip?: number,
  ) => Promise<string>;

  manageConcurrency: (token: string) => Promise<void>;

  getTextFileOrThrow: (
    token: string,
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

  getConventionalCommitParserOptions: () => ParserOptions;
}
