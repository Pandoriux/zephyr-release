import type { ParserOptions } from "conventional-commits-parser";
import type { ProviderBranch } from "./branch.ts";
import type { ProviderConcurrencyResult } from "./concurrency.ts";
import type {
  ProviderAssetParams,
  ProviderRelease,
  ProviderReleaseOptions,
} from "./release.ts";
import type { ProviderLabel } from "./label.ts";
import type { CoreLogger } from "../logger.ts";
import type {
  ProviderCommit,
  ProviderCommitDetails,
  ProviderCompareCommits,
  ProviderWorkingCommit,
} from "./commit.ts";
import type { ProviderInputs } from "./inputs.ts";
import type { ProviderPullRequest } from "./pull-request.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";
import type { ProviderOperationTriggerContext } from "../operation-context.ts";
import type { ProviderTag } from "./tag.ts";
import type { TaggerRequest } from "../tag.ts";
import type { TagTypeOption } from "../../constants/release-tag-options.ts";

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
  getOperationTriggerContextOrThrow: () => ProviderOperationTriggerContext;

  getCompareTagUrl: (tag1: string, tag2: string) => string;
  getCompareTagUrlFromCurrentToLatest: (
    currentTag: string,
    skip?: number,
  ) => Promise<string>;

  manageConcurrency: () => Promise<ProviderConcurrencyResult>;

  getTextFileOrThrow: (filePath: string, ref?: string) => Promise<string>;

  ensureBranchExistOrThrow: (
    branchName: string,
    commitHash: string,
  ) => Promise<ProviderBranch>;

  findUniquePullRequestForCommitOrThrow: (
    commitHash: string,
    sourceBranch: string,
    targetBranch: string,
    label: string,
  ) => Promise<ProviderPullRequest | undefined>;

  findUniquePullRequestFromBranchOrThrow: (
    branchName: string,
    targetBranch: string,
    requiredLabel: string,
  ) => Promise<ProviderPullRequest | undefined>;

  findCommitsFromGivenToPreviousTaggedOrThrow: (
    commitHash: string,
    stopResolvingCommitAt?: number | string,
  ) => Promise<ProviderCommit[]>;
  compareCommitsOrThrow: (
    base: string,
    head: string,
  ) => Promise<ProviderCompareCommits>;
  getCommit: (hash: string) => Promise<ProviderCommitDetails>;
  createCommitOnBranchOrThrow: (
    triggerCommitHash: string,
    baseTreeHash: string,
    changesToCommit: Map<string, string>,
    message: string,
    workingBranchName: string,
  ) => Promise<ProviderWorkingCommit>;

  createPullRequestOrThrow: (
    sourceBranch: string,
    targetBranch: string,
    title: string,
    body: string,
  ) => Promise<ProviderPullRequest>;
  updatePullRequestOrThrow: (
    number: number,
    title: string,
    body: string,
  ) => Promise<ProviderPullRequest>;

  addLabelsToPullRequestOrThrow: (
    prNumber: number,
    labels: ProviderLabel[],
    optionalLabels?: string[],
  ) => Promise<void>;

  getLatestReleaseTagOrThrow: () => Promise<string | undefined>;
  createTagOrThrow: (
    tagName: string,
    commitHash: string,
    tagType: TagTypeOption,
    message: string,
    tagger?: TaggerRequest,
  ) => Promise<ProviderTag>;

  createReleaseOrThrow: (
    tagName: string,
    title: string,
    body: string,
    options: ProviderReleaseOptions,
  ) => Promise<ProviderRelease>;
  attachReleaseAssetOrThrow: (
    releaseId: string,
    asset: ProviderAssetParams,
  ) => Promise<void>;

  exportOutputs: (k: string, v: string | number | null | undefined) => void;
  exportEnvVars: (k: string, v: string | number | null | undefined) => void;

  getConventionalCommitParserOptions: () => ParserOptions;
}
