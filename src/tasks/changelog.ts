import { toTitleCase } from "@std/text/unstable-to-title-case";
import type { ResolvedCommit } from "./commit.ts";
import { getTextFile } from "./file.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ChangelogConfigOutput } from "../schemas/configs/modules/changelog-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import { resolveStringTemplate } from "./string-templates-and-patterns/resolve-template.ts";
import type { ChangelogReleaseEntryPattern } from "../constants/string-patterns.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { CHANGELOG_MARKERS } from "../constants/markers.ts";
import { failedNonCriticalTasks } from "../main.ts";
import { taskLogger } from "./logger.ts";

type GenerateChangelogReleaseInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "workspacePath" | "sourceMode"
>;

type GenerateChangelogReleaseConfigParams =
  & Pick<ConfigOutput, "commitTypes">
  & {
    changelog: Pick<
      ChangelogConfigOutput,
      | "releaseHeaderTemplate"
      | "releaseHeaderTemplatePath"
      | "releaseSectionEntryTemplate"
      | "releaseSectionEntryTemplatePath"
      | "releaseBreakingSectionHeading"
      | "releaseBreakingSectionEntryTemplate"
      | "releaseBreakingSectionEntryTemplatePath"
      | "releaseFooterTemplate"
      | "releaseFooterTemplatePath"
      | "releaseBodyOverride"
      | "releaseBodyOverridePath"
    >;
  };

interface GeneratePrepareReleaseContentResult {
  release: string;
  releaseBody: string;
}

/** @throws */
export async function generatePrepareChangelogReleaseContent(
  provider: PlatformProvider,
  resolvedCommits: ResolvedCommit[],
  inputs: GenerateChangelogReleaseInputsParams,
  config: GenerateChangelogReleaseConfigParams,
): Promise<GeneratePrepareReleaseContentResult> {
  const [releaseHeader, releaseBody, releaseFooter] = await Promise.all([
    resolveReleaseHeader(provider, inputs, config),
    resolveReleaseBody(provider, resolvedCommits, inputs, config),
    resolveReleaseFooter(provider, inputs, config),
  ]);

  return {
    release: [releaseHeader, releaseBody, releaseFooter].filter(Boolean).join(
      "\n\n",
    ),
    releaseBody,
  };
}

interface GeneratePublishReleaseContentResult {
  release: string;
  releaseBody?: string;
}

export async function generatePublishChangelogReleaseContent(
  provider: PlatformProvider,
  proposalChangelogRelease: string,
  inputs: GenerateChangelogReleaseInputsParams,
  config: GenerateChangelogReleaseConfigParams,
): Promise<GeneratePublishReleaseContentResult | undefined> {
  try {
    const { releaseBodyOverride, releaseBodyOverridePath } = config.changelog;

    if (releaseBodyOverride || releaseBodyOverridePath) {
      const [releaseHeader, releaseBody, releaseFooter] = await Promise.all([
        resolveReleaseHeader(provider, inputs, config),
        resolveReleaseBody(provider, undefined, inputs, config),
        resolveReleaseFooter(provider, inputs, config),
      ]);

      return {
        release: [releaseHeader, releaseBody, releaseFooter].filter(Boolean)
          .join(
            "\n\n",
          ),
        releaseBody,
      };
    }

    // If no override, the value is just the proposal body.
    return { release: proposalChangelogRelease };
  } catch (error) {
    const message = `Failed to generate publish changelog release content: ${
      error instanceof Error ? error.message : String(error)
    }`;

    taskLogger.warn(message);
    failedNonCriticalTasks.push(message);

    return { release: proposalChangelogRelease };
  }
}

async function resolveReleaseHeader(
  provider: PlatformProvider,
  inputs: GenerateChangelogReleaseInputsParams,
  config: GenerateChangelogReleaseConfigParams,
): Promise<string> {
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;
  const {
    changelog: { releaseHeaderTemplate, releaseHeaderTemplatePath },
  } = config;

  if (releaseHeaderTemplatePath) {
    const headerTemplate = await getTextFile(
      sourceMode.overrides?.[releaseHeaderTemplatePath] ?? sourceMode.mode,
      releaseHeaderTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    return await resolveStringTemplate(headerTemplate);
  }

  return await resolveStringTemplate(releaseHeaderTemplate);
}

/** @throws */
async function resolveReleaseBody(
  provider: PlatformProvider,
  resolvedCommits: ResolvedCommit[] | undefined,
  inputs: GenerateChangelogReleaseInputsParams,
  config: GenerateChangelogReleaseConfigParams,
): Promise<string> {
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;
  const {
    changelog: { releaseBodyOverride, releaseBodyOverridePath },
  } = config;

  if (releaseBodyOverridePath) {
    return await getTextFile(
      sourceMode.overrides?.[releaseBodyOverridePath] ?? sourceMode.mode,
      releaseBodyOverridePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
  }

  if (releaseBodyOverride) {
    return releaseBodyOverride;
  }

  if (!resolvedCommits) {
    throw new Error(
      "resolvedCommits must be provided to generate a release body when no override is configured",
    );
  }

  return await generateReleaseBodyBasedOnCommits(
    provider,
    resolvedCommits,
    inputs,
    config,
  );
}

async function resolveReleaseFooter(
  provider: PlatformProvider,
  inputs: GenerateChangelogReleaseInputsParams,
  config: GenerateChangelogReleaseConfigParams,
): Promise<string | undefined> {
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;
  const {
    changelog: { releaseFooterTemplate, releaseFooterTemplatePath },
  } = config;

  if (releaseFooterTemplatePath) {
    const footerTemplate = await getTextFile(
      sourceMode.overrides?.[releaseFooterTemplatePath] ?? sourceMode.mode,
      releaseFooterTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    return await resolveStringTemplate(footerTemplate);
  }

  if (releaseFooterTemplate) {
    return await resolveStringTemplate(releaseFooterTemplate);
  }

  return undefined;
}

async function generateReleaseBodyBasedOnCommits(
  provider: PlatformProvider,
  resolvedCommits: ResolvedCommit[],
  inputs: GenerateChangelogReleaseInputsParams,
  config: GenerateChangelogReleaseConfigParams,
): Promise<string> {
  const {
    commitTypes,
    changelog: {
      releaseSectionEntryTemplate,
      releaseSectionEntryTemplatePath,
      releaseBreakingSectionHeading,
      releaseBreakingSectionEntryTemplate,
      releaseBreakingSectionEntryTemplatePath,
    },
  } = config;
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;

  // Section -> Commits
  const sectionGroups = new Map<string, string[]>();
  // Type -> Section
  const typeToSection = new Map<string, string>();

  const breakingSectionHeading = await resolveStringTemplate(
    releaseBreakingSectionHeading,
  );
  sectionGroups.set(breakingSectionHeading, []);

  for (const ct of commitTypes) {
    if (ct.hidden) continue;

    const sectionName = ct.section ?? toTitleCase(ct.type);
    typeToSection.set(ct.type, sectionName);

    if (!sectionGroups.has(sectionName)) {
      sectionGroups.set(sectionName, []);
    }
  }

  const sectionEntryTemplate = releaseSectionEntryTemplatePath
    ? await getTextFile(
      sourceMode.overrides?.[releaseSectionEntryTemplatePath] ??
        sourceMode.mode,
      releaseSectionEntryTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    )
    : releaseSectionEntryTemplate;

  const breakingSectionEntryTemplate = releaseBreakingSectionEntryTemplatePath
    ? await getTextFile(
      sourceMode.overrides?.[releaseBreakingSectionEntryTemplatePath] ??
        sourceMode.mode,
      releaseBreakingSectionEntryTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    )
    : releaseBreakingSectionEntryTemplate;

  // Process Commits
  for (const commit of resolvedCommits) {
    const section = typeToSection.get(commit.type);
    if (!section) continue;

    const sectionContents = sectionGroups.get(section);
    if (!sectionContents) continue;

    const commitPatterns = createCommitExtraPatterns(commit);

    const commitStr = await resolveStringTemplate(
      sectionEntryTemplate,
      commitPatterns,
    );
    sectionContents.push(commitStr);

    if (commit.isBreaking) {
      const commitBreakingStr = breakingSectionEntryTemplate
        ? await resolveStringTemplate(
          breakingSectionEntryTemplate,
          commitPatterns,
        )
        : commitStr;

      const breakingSectionContents = sectionGroups.get(breakingSectionHeading);

      // Safeguard to satisfy TypeScript types; this should theoretically be impossible to throw
      // as the section is initialized at the start of the function.
      if (!breakingSectionContents!) {
        throw new Error(
          `${generatePrepareChangelogReleaseContent.name} failed: Breaking Changes section has not been initialized?`,
        );
      }

      breakingSectionContents.push(commitBreakingStr);
    }
  }

  // Final Polish: Sort each folder and join into one string
  const finalReleaseBody: string[] = [];

  for (const [section, entries] of sectionGroups) {
    if (entries.length === 0) continue;

    finalReleaseBody.push(section);
    finalReleaseBody.push(entries.sort().join("\n"));
  }

  return finalReleaseBody.join("\n\n");
}

function createCommitExtraPatterns(
  commit: ResolvedCommit,
): Record<ChangelogReleaseEntryPattern, unknown> {
  return {
    commit,
    hash: commit.hash,
    type: commit.type,
    scope: commit.scope,
    desc: commit.subject,
    body: commit.body,
    footer: commit.footer,
    isBreaking: commit.isBreaking,
  };
}

type PrepareChangelogParams = Pick<
  ChangelogConfigOutput,
  | "path"
  | "fileHeaderTemplate"
  | "fileHeaderTemplatePath"
  | "fileFooterTemplate"
  | "fileFooterTemplatePath"
>;

export async function prepareChangelogFileToCommit(
  provider: PlatformProvider,
  changelogConfig: PrepareChangelogParams,
  sourceMode: InputsOutput["sourceMode"],
  workspacePath: string,
  releaseContent: string,
  triggerCommitHash: string,
): Promise<string> {
  const {
    path,
    fileHeaderTemplate,
    fileHeaderTemplatePath,
    fileFooterTemplate,
    fileFooterTemplatePath,
  } = changelogConfig;

  const changelogSourceMode = sourceMode.overrides?.[path] ?? sourceMode.mode;

  const currentFileContent = await getTextFile(
    changelogSourceMode,
    path,
    { provider, workspacePath: workspacePath, ref: triggerCommitHash },
  );

  let header: string;
  if (fileHeaderTemplatePath) {
    const headerTemplate = await getTextFile(
      sourceMode.overrides?.[fileHeaderTemplatePath] ?? sourceMode.mode,
      fileHeaderTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    header = await resolveStringTemplate(headerTemplate);
  } else header = await resolveStringTemplate(fileHeaderTemplate);

  let footer: string | undefined;
  if (fileFooterTemplatePath) {
    const footerTemplate = await getTextFile(
      sourceMode.overrides?.[fileFooterTemplatePath] ?? sourceMode.mode,
      fileFooterTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    footer = await resolveStringTemplate(footerTemplate);
  } else if (fileFooterTemplate) {
    footer = await resolveStringTemplate(fileFooterTemplate);
  }

  if (!currentFileContent.trim()) {
    const bodyWithMarkers = [
      CHANGELOG_MARKERS.bodyStart,
      releaseContent,
      CHANGELOG_MARKERS.bodyEnd,
    ].join("\n");

    return [header, bodyWithMarkers, footer].filter(Boolean).join("\n\n");
  } else {
    // check if fileContent have the marker from CHANGELOG_MARKERS start and end
    const bodyStartMarkerIndex = currentFileContent.indexOf(
      CHANGELOG_MARKERS.bodyStart,
    );
    const bodyEndMarkerIndex = currentFileContent.lastIndexOf(
      CHANGELOG_MARKERS.bodyEnd,
    );

    if (bodyStartMarkerIndex === -1 || bodyEndMarkerIndex === -1) {
      // Markers not found - treat current content as old and archive it
      const archivedContent = [
        CHANGELOG_MARKERS.archived,
        "---",
        currentFileContent,
      ].join("\n");

      const bodyWithMarkers = [
        CHANGELOG_MARKERS.bodyStart,
        releaseContent,
        CHANGELOG_MARKERS.bodyEnd,
      ].join("\n");

      return [header, bodyWithMarkers, footer, archivedContent].filter(Boolean)
        .join("\n\n");
    } else {
      // Markers exist - update content between outermost markers

      // Handle update body
      const bodyStartMarkerEndIndex = bodyStartMarkerIndex +
        CHANGELOG_MARKERS.bodyStart.length;

      const existingBodyContent = currentFileContent.substring(
        bodyStartMarkerEndIndex,
        bodyEndMarkerIndex,
      ).trim();

      const updatedBody = existingBodyContent
        ? [releaseContent, existingBodyContent].join("\n\n")
        : releaseContent;

      const updatedBodyWithMarkers = [
        CHANGELOG_MARKERS.bodyStart,
        updatedBody,
        CHANGELOG_MARKERS.bodyEnd,
      ].join("\n");

      // Handle archive
      const bodyEndMarkerEndIndex = bodyEndMarkerIndex +
        CHANGELOG_MARKERS.bodyEnd.length;
      const contentAfterBodyEnd = currentFileContent.substring(
        bodyEndMarkerEndIndex,
      );

      const archivedMarkerIndex = contentAfterBodyEnd.indexOf(
        CHANGELOG_MARKERS.archived,
      );

      let archivedContent: string | undefined;
      if (archivedMarkerIndex !== -1) {
        archivedContent = contentAfterBodyEnd.substring(archivedMarkerIndex);
      }

      return [header, updatedBodyWithMarkers, footer, archivedContent].filter(
        Boolean,
      )
        .join("\n\n");
    }
  }
}
