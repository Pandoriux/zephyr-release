import { taskLogger } from "./logger.ts";
import type { CoreLabelOutput } from "../schemas/configs/modules/components/core-label.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderPullRequest } from "../types/providers/pull-request.ts";
import type { PullRequestConfigOutput } from "../schemas/configs/modules/pull-request-config.ts";
import { getTextFileOrThrow } from "./file.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";
import { sample } from "@std/collections";
import { PR_MARKERS } from "../constants/markers.ts";

type FindPrForCommitInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "triggerBranchName"
>;

interface PullRequestBranchAndLabelConfigParams {
  pullRequest: {
    label: { onCreate: CoreLabelOutput["onCreate"] };
  };
}

export async function findPullRequestForCommitOrThrow(
  provider: PlatformProvider,
  workingBranchName: string,
  inputs: FindPrForCommitInputsParams,
  config: PullRequestBranchAndLabelConfigParams,
): Promise<ProviderPullRequest | undefined> {
  const { triggerCommitHash, triggerBranchName } = inputs;

  const label = typeof config.pullRequest.label.onCreate === "string"
    ? config.pullRequest.label.onCreate
    : config.pullRequest.label.onCreate.name;

  const foundPr = await provider.findUniquePullRequestForCommitOrThrow(
    triggerCommitHash,
    workingBranchName,
    triggerBranchName,
    label,
  );

  taskLogger.debug(
    `Found associated pull request for trigger commit (${triggerCommitHash}):\n` +
      JSON.stringify(foundPr, null, 2),
  );

  return foundPr;
}

export async function findPullRequestFromBranchOrThrow(
  provider: PlatformProvider,
  workingBranchName: string,
  inputs: FindPrForCommitInputsParams,
  config: PullRequestBranchAndLabelConfigParams,
): Promise<ProviderPullRequest | undefined> {
  const { triggerBranchName } = inputs;

  const label = typeof config.pullRequest.label.onCreate === "string"
    ? config.pullRequest.label.onCreate
    : config.pullRequest.label.onCreate.name;

  const foundPr = await provider.findUniquePullRequestFromBranchOrThrow(
    workingBranchName,
    triggerBranchName,
    label,
  );

  taskLogger.debug(
    `Found associated pull request for branch '${workingBranchName}':\n` +
      JSON.stringify(foundPr, null, 2),
  );

  return foundPr;
}

interface CreatePullRequestContentConfigParams {
  pullRequest: Pick<
    PullRequestConfigOutput,
    | "headerTemplate"
    | "headerTemplatePath"
    | "bodyTemplate"
    | "bodyTemplatePath"
    | "footerTemplate"
    | "footerTemplatePath"
  >;
}

export async function createPullRequestContent(
  provider: PlatformProvider,
  inputs: Pick<
    InputsOutput,
    "triggerCommitHash" | "sourceMode" | "workspacePath"
  >,
  config: CreatePullRequestContentConfigParams,
): Promise<string> {
  const {
    headerTemplate,
    headerTemplatePath,
    bodyTemplate,
    bodyTemplatePath,
    footerTemplate,
    footerTemplatePath,
  } = config.pullRequest;
  const { triggerCommitHash, sourceMode, workspacePath } = inputs;

  let prHeader: string;
  if (headerTemplatePath) {
    const prHeaderTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[headerTemplatePath] ?? sourceMode.mode,
      headerTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    prHeader = await resolveStringTemplateOrThrow(prHeaderTemplate);
  } else {
    const prHeaderTemplate = sample(headerTemplate);
    if (!prHeaderTemplate) throw new Error("No header template available");

    prHeader = await resolveStringTemplateOrThrow(prHeaderTemplate);
  }

  let prBody: string;
  if (bodyTemplatePath) {
    const prBodyTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[bodyTemplatePath] ?? sourceMode.mode,
      bodyTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    prBody = await resolveStringTemplateOrThrow(prBodyTemplate);
  } else {
    prBody = await resolveStringTemplateOrThrow(bodyTemplate);
  }
  const prBodyWithMarkers = [PR_MARKERS.bodyStart, prBody, PR_MARKERS.bodyEnd]
    .join("\n");

  let prFooter: string;
  if (footerTemplatePath) {
    const prFooterTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[footerTemplatePath] ?? sourceMode.mode,
      footerTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    prFooter = await resolveStringTemplateOrThrow(prFooterTemplate);
  } else {
    prFooter = await resolveStringTemplateOrThrow(footerTemplate);
  }

  return [prHeader, prBodyWithMarkers, prFooter].filter(Boolean).join("\n\n");
}

interface CreateOrUpdatePullRequestConfigParams {
  pullRequest: Pick<
    PullRequestConfigOutput,
    | "titleTemplate"
    | "titleTemplatePath"
    | "headerTemplate"
    | "headerTemplatePath"
    | "bodyTemplate"
    | "bodyTemplatePath"
    | "footerTemplate"
    | "footerTemplatePath"
  >;
}

export async function createOrUpdatePullRequestOrThrow(
  provider: PlatformProvider,
  options: {
    workingBranchName: string;
    triggerBranchName: string;
    associatedPrFromBranch: ProviderPullRequest | undefined;
  },
  inputs: Pick<
    InputsOutput,
    "triggerCommitHash" | "workspacePath" | "sourceMode"
  >,
  config: CreateOrUpdatePullRequestConfigParams,
): Promise<number> {
  const {
    workingBranchName,
    triggerBranchName,
    associatedPrFromBranch,
  } = options;
  const { titleTemplate } = config.pullRequest;

  const prTitle = await resolveStringTemplateOrThrow(titleTemplate);
  const prContent = await createPullRequestContent(
    provider,
    inputs,
    config,
  );

  let prNumber: number;
  if (associatedPrFromBranch) {
    taskLogger.info("Updating current working PR...");
    const updatedPr = await provider.updatePullRequestOrThrow(
      associatedPrFromBranch.number,
      prTitle,
      prContent,
    );
    prNumber = updatedPr.number;
  } else {
    taskLogger.info("Creating new working PR...");
    const newPr = await provider.createPullRequestOrThrow(
      workingBranchName,
      triggerBranchName,
      prTitle,
      prContent,
    );
    prNumber = newPr.number;
  }

  return prNumber;
}

export function extractChangelogFromPr(
  mergedPr: ProviderPullRequest,
): string | undefined {
  const changelogReleaseStartIndex = mergedPr.body.indexOf(
    PR_MARKERS.bodyStart,
  );
  const changelogReleaseEndIndex = mergedPr.body.lastIndexOf(
    PR_MARKERS.bodyEnd,
  );

  if (changelogReleaseStartIndex === -1 || changelogReleaseEndIndex === -1) {
    return undefined;
  }

  const changelogRelease = mergedPr.body.substring(
    changelogReleaseStartIndex + PR_MARKERS.bodyStart.length,
    changelogReleaseEndIndex,
  ).trim();
  taskLogger.info(
    "Extracted changelog release from merged PR body: " + changelogRelease,
  );

  return changelogRelease;
}
