import type { ParserOptions } from "conventional-commits-parser";
import type { CoreLogger } from "../logger.ts";
import type { ProviderBranch } from "./branch.ts";
import type { ProviderCommit } from "./commit.ts";
import type { ProviderInputs } from "./inputs.ts";
import type { ProviderPullRequest } from "./pull-request.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";

export interface PlatformProvider {
  platform: "github" | ""; // gitlab? local?

  logger: CoreLogger;

  getRawInputs: () => ProviderInputs;
  setupProviderContext: (validatedInputs: InputsOutput) => void;

  getHost: () => string;
  getNamespace: () => string;
  getRepositoryName: () => string;
  getCommitPathPart: () => string;
  getReferencePathPart: () => string;

  getCompareTagUrl: (tag1: string, tag2: string) => string;
  getCompareTagUrlFromCurrentToLatest: (
    currentTag: string,
    skip?: number,
  ) => Promise<string>;

  manageConcurrency: () => Promise<void>;

  getTextFileOrThrow: (filePath: string) => Promise<string>;

  ensureBranchAtCommitOrThrow: (
    branchName: string,
    commitHash: string,
  ) => Promise<ProviderBranch>;

  findCommitsFromGivenToPreviousTaggedOrThrow: (
    commitHash: string,
  ) => Promise<ProviderCommit[]>;

  findUniquePullRequestForCommitOrThrow: (
    commitHash: string,
    sourceBranch: string,
    label: string,
  ) => Promise<ProviderPullRequest | undefined>;

  findUniquePullRequestFromBranchOrThrow: (
    branchName: string,
    requiredLabel: string,
  ) => Promise<ProviderPullRequest | undefined>;

  exportOutputs: (k: string, v: string) => void;
  exportEnvVars: (k: string, v: string) => void;

  getConventionalCommitParserOptions: () => ParserOptions;
}
