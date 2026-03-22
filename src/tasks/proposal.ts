import { taskLogger } from "./logger.ts";
import type { CoreLabelOutput } from "../schemas/configs/modules/components/core-label.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderProposal } from "../types/providers/proposal.ts";
import type { ReviewConfigOutput } from "../schemas/configs/modules/review-config.ts";
import { getTextFileOrThrow } from "./file.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";
import { PROPOSAL_MARKERS } from "../constants/markers.ts";

type FindProposalForCommitInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "triggerBranchName"
>;

interface ProposalBranchAndLabelConfigParams {
  review: {
    label: { onCreate: CoreLabelOutput["onCreate"] };
  };
}

export async function findProposalForCommitOrThrow(
  provider: PlatformProvider,
  workingBranchName: string,
  inputs: FindProposalForCommitInputsParams,
  config: ProposalBranchAndLabelConfigParams,
): Promise<ProviderProposal | undefined> {
  const { triggerCommitHash, triggerBranchName } = inputs;

  const label = typeof config.review.label.onCreate === "string"
    ? config.review.label.onCreate
    : config.review.label.onCreate.name;

  const foundProposal = await provider.findUniqueProposalForCommitOrThrow(
    triggerCommitHash,
    workingBranchName,
    triggerBranchName,
    label,
  );

  taskLogger.debug(
    `Found associated proposal for trigger commit (${triggerCommitHash}):\n` +
      JSON.stringify(foundProposal, null, 2),
  );

  return foundProposal;
}

export async function findProposalFromBranchOrThrow(
  provider: PlatformProvider,
  workingBranchName: string,
  inputs: FindProposalForCommitInputsParams,
  config: ProposalBranchAndLabelConfigParams,
): Promise<ProviderProposal | undefined> {
  const { triggerBranchName } = inputs;

  const label = typeof config.review.label.onCreate === "string"
    ? config.review.label.onCreate
    : config.review.label.onCreate.name;

  const foundProposal = await provider.findUniqueProposalFromBranchOrThrow(
    workingBranchName,
    triggerBranchName,
    label,
  );

  taskLogger.debug(
    `Found associated proposal for branch '${workingBranchName}':\n` +
      JSON.stringify(foundProposal, null, 2),
  );

  return foundProposal;
}

interface CreateProposalContentConfigParams {
  review: Pick<
    ReviewConfigOutput,
    | "headerTemplate"
    | "headerTemplatePath"
    | "bodyTemplate"
    | "bodyTemplatePath"
    | "footerTemplate"
    | "footerTemplatePath"
  >;
}

export async function createProposalContent(
  provider: PlatformProvider,
  inputs: Pick<
    InputsOutput,
    "triggerCommitHash" | "sourceMode" | "workspacePath"
  >,
  config: CreateProposalContentConfigParams,
): Promise<string> {
  const {
    headerTemplate,
    headerTemplatePath,
    bodyTemplate,
    bodyTemplatePath,
    footerTemplate,
    footerTemplatePath,
  } = config.review;
  const { triggerCommitHash, sourceMode, workspacePath } = inputs;

  let proposalHeader: string;
  if (headerTemplatePath) {
    const proposalHeaderTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[headerTemplatePath] ?? sourceMode.mode,
      headerTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    proposalHeader = await resolveStringTemplateOrThrow(proposalHeaderTemplate);
  } else {
    proposalHeader = await resolveStringTemplateOrThrow(headerTemplate);
  }

  let proposalBody: string;
  if (bodyTemplatePath) {
    const proposalBodyTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[bodyTemplatePath] ?? sourceMode.mode,
      bodyTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    proposalBody = await resolveStringTemplateOrThrow(proposalBodyTemplate);
  } else {
    proposalBody = await resolveStringTemplateOrThrow(bodyTemplate);
  }
  const proposalBodyWithMarkers = [
    PROPOSAL_MARKERS.bodyStart,
    proposalBody,
    PROPOSAL_MARKERS.bodyEnd,
  ]
    .join("\n");

  let proposalFooter: string;
  if (footerTemplatePath) {
    const proposalFooterTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[footerTemplatePath] ?? sourceMode.mode,
      footerTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    proposalFooter = await resolveStringTemplateOrThrow(proposalFooterTemplate);
  } else {
    proposalFooter = await resolveStringTemplateOrThrow(footerTemplate);
  }

  return [proposalHeader, proposalBodyWithMarkers, proposalFooter].filter(
    Boolean,
  ).join("\n\n");
}

interface CreateOrUpdateProposalConfigParams {
  review: Pick<
    ReviewConfigOutput,
    | "draft"
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

export async function createOrUpdateProposalOrThrow(
  provider: PlatformProvider,
  proposalData: {
    workingBranchName: string;
    triggerBranchName: string;
    associatedProposalFromBranch: ProviderProposal | undefined;
  },
  inputs: Pick<
    InputsOutput,
    "triggerCommitHash" | "workspacePath" | "sourceMode"
  >,
  config: CreateOrUpdateProposalConfigParams,
): Promise<ProviderProposal> {
  const {
    workingBranchName,
    triggerBranchName,
    associatedProposalFromBranch,
  } = proposalData;
  const { draft, titleTemplate } = config.review;

  const proposalTitle = await resolveStringTemplateOrThrow(titleTemplate);
  const proposalContent = await createProposalContent(
    provider,
    inputs,
    config,
  );

  let proposal: ProviderProposal;
  if (associatedProposalFromBranch) {
    taskLogger.info("Updating current working proposal...");
    proposal = await provider.updateProposalOrThrow(
      associatedProposalFromBranch.id,
      proposalTitle,
      proposalContent,
    );
  } else {
    taskLogger.info("Creating new working proposal...");
    proposal = await provider.createProposalOrThrow(
      workingBranchName,
      triggerBranchName,
      proposalTitle,
      proposalContent,
      { draft },
    );
  }

  return proposal;
}

export function extractChangelogFromProposal(
  mergedProposal: ProviderProposal,
): string | undefined {
  const changelogReleaseStartIndex = mergedProposal.body.indexOf(
    PROPOSAL_MARKERS.bodyStart,
  );
  const changelogReleaseEndIndex = mergedProposal.body.lastIndexOf(
    PROPOSAL_MARKERS.bodyEnd,
  );

  if (changelogReleaseStartIndex === -1 || changelogReleaseEndIndex === -1) {
    return undefined;
  }

  const changelogRelease = mergedProposal.body.substring(
    changelogReleaseStartIndex + PROPOSAL_MARKERS.bodyStart.length,
    changelogReleaseEndIndex,
  ).trim();
  taskLogger.info(
    "Extracted changelog release from merged proposal body: " +
      changelogRelease,
  );

  return changelogRelease;
}
