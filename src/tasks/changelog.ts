import { toTitleCase } from "@std/text/unstable-to-title-case";
import type { ResolvedCommit } from "./commit.ts";
import { getTextFileOrThrow } from "./file.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ChangelogConfigOutput } from "../schemas/configs/modules/changelog-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";
import type { ChangelogReleaseEntryPattern } from "../constants/string-patterns.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { CHANGELOG_MARKERS } from "../constants/markers.ts";

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

export interface GenerateChangelogReleaseResult {
  release: string;
  releaseBody: string;
}

export async function generateChangelogReleaseContent(
  provider: PlatformProvider,
  resolvedCommits: ResolvedCommit[],
  inputs: GenerateChangelogReleaseInputsParams,
  config: GenerateChangelogReleaseConfigParams,
): Promise<GenerateChangelogReleaseResult> {
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;
  const {
    // commitTypes,
    changelog: {
      releaseHeaderTemplate,
      releaseHeaderTemplatePath,
      // releaseSectionEntryTemplate,
      // releaseSectionEntryTemplatePath,
      // releaseBreakingSectionHeading,
      // releaseBreakingSectionEntryTemplate,
      // releaseBreakingSectionEntryTemplatePath,
      releaseFooterTemplate,
      releaseFooterTemplatePath,
      releaseBodyOverride,
      releaseBodyOverridePath,
    },
  } = config;

  let releaseHeader: string;
  if (releaseHeaderTemplatePath) {
    const headerTemplate = await getTextFileOrThrow(
      sourceMode.changelogReleaseHeaderTemplatePath ?? sourceMode.sourceMode,
      releaseHeaderTemplatePath,
      { provider, workspace: workspacePath, ref: triggerCommitHash },
    );
    releaseHeader = await resolveStringTemplateOrThrow(headerTemplate);
  } else {
    releaseHeader = await resolveStringTemplateOrThrow(
      releaseHeaderTemplate,
    );
  }

  let releaseFooter: string | undefined;
  if (releaseFooterTemplatePath) {
    const footerTemplate = await getTextFileOrThrow(
      sourceMode.changelogReleaseFooterTemplatePath ?? sourceMode.sourceMode,
      releaseFooterTemplatePath,
      { provider, workspace: workspacePath, ref: triggerCommitHash },
    );
    releaseFooter = await resolveStringTemplateOrThrow(footerTemplate);
  } else if (releaseFooterTemplate) {
    releaseFooter = await resolveStringTemplateOrThrow(
      releaseFooterTemplate,
    );
  }

  let releaseBody: string;
  if (releaseBodyOverridePath) {
    releaseBody = await getTextFileOrThrow(
      sourceMode.changelogReleaseBodyOverridePath ?? sourceMode.sourceMode,
      releaseBodyOverridePath,
      { provider, workspace: workspacePath, ref: triggerCommitHash },
    );
  } else if (releaseBodyOverride) {
    releaseBody = releaseBodyOverride;
  } else {
    releaseBody = await generateReleaseBody(
      provider,
      resolvedCommits,
      inputs,
      config,
    );
  }

  return {
    release: [releaseHeader, releaseBody, releaseFooter].join("\n\n"),
    releaseBody,
  };
}

async function generateReleaseBody(
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

  const breakingSectionHeading = await resolveStringTemplateOrThrow(
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
    ? await getTextFileOrThrow(
      sourceMode.changelogReleaseSectionEntryTemplatePath ?? sourceMode.sourceMode,
      releaseSectionEntryTemplatePath,
      { provider, workspace: workspacePath, ref: triggerCommitHash },
    )
    : releaseSectionEntryTemplate;

  const breakingSectionEntryTemplate = releaseBreakingSectionEntryTemplatePath
    ? await getTextFileOrThrow(
      sourceMode.changelogReleaseBreakingSectionEntryTemplatePath ?? sourceMode.sourceMode,
      releaseBreakingSectionEntryTemplatePath,
      { provider, workspace: workspacePath, ref: triggerCommitHash },
    )
    : releaseBreakingSectionEntryTemplate;

  // Process Commits
  for (const commit of resolvedCommits) {
    const section = typeToSection.get(commit.type);
    if (!section) continue;

    const sectionContents = sectionGroups.get(section);
    if (!sectionContents) continue;

    const commitPatterns = createCommitExtraPatterns(commit);

    const commitStr = await resolveStringTemplateOrThrow(
      sectionEntryTemplate,
      commitPatterns,
    );
    sectionContents.push(commitStr);

    if (commit.isBreaking) {
      const commitBreakingStr = breakingSectionEntryTemplate
        ? await resolveStringTemplateOrThrow(
          breakingSectionEntryTemplate,
          commitPatterns,
        )
        : commitStr;

      const breakingSectionContents = sectionGroups.get(breakingSectionHeading);
      if (!breakingSectionContents!) {
        throw new Error(
          `${generateChangelogReleaseContent.name} failed: Breaking Changes section has not been initialized?`,
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

  const changelogSourceMode = sourceMode.changelogPath
    ? sourceMode.changelogPath
    : sourceMode.sourceMode;

  const currentFileContent = await getTextFileOrThrow(
    changelogSourceMode,
    path,
    { provider, workspace: workspacePath, ref: triggerCommitHash },
  );

  let header: string;
  if (fileHeaderTemplatePath) {
    const headerTemplate = await getTextFileOrThrow(
      sourceMode.changelogFileHeaderTemplatePath ?? sourceMode.sourceMode,
      fileHeaderTemplatePath,
      { provider, workspace: workspacePath, ref: triggerCommitHash },
    );
    header = await resolveStringTemplateOrThrow(headerTemplate);
  } else header = await resolveStringTemplateOrThrow(fileHeaderTemplate);

  let footer: string | undefined;
  if (fileFooterTemplatePath) {
    const footerTemplate = await getTextFileOrThrow(
      sourceMode.changelogFileFooterTemplatePath ?? sourceMode.sourceMode,
      fileFooterTemplatePath,
      { provider, workspace: workspacePath, ref: triggerCommitHash },
    );
    footer = await resolveStringTemplateOrThrow(footerTemplate);
  } else if (fileFooterTemplate) {
    footer = await resolveStringTemplateOrThrow(fileFooterTemplate);
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
