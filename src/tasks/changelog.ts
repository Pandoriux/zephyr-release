import { toTitleCase } from "@std/text/unstable-to-title-case";
import type { ResolvedCommit } from "./commit.ts";
import { getTextFileOrThrow } from "./file.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ChangelogConfigOutput } from "../schemas/configs/modules/changelog-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";
import type { ChangelogReleaseEntryPattern } from "../constants/string-patterns.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";

type GenerateChangelogReleaseInputsParams = Pick<
  InputsOutput,
  "workspacePath" | "sourceMode"
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

export async function generateChangelogReleaseContent(
  provider: PlatformProvider,
  resolvedCommits: ResolvedCommit[],
  inputs: GenerateChangelogReleaseInputsParams,
  config: GenerateChangelogReleaseConfigParams,
): Promise<string> {
  const { workspacePath, sourceMode } = inputs;
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
    releaseHeader = await getTextFileOrThrow(
      sourceMode.sourceMode,
      releaseHeaderTemplatePath,
      { provider, workspace: workspacePath },
    );
  } else {
    releaseHeader = await resolveStringTemplateOrThrow(
      releaseHeaderTemplate,
    );
  }

  let releaseFooter: string | undefined;
  if (releaseFooterTemplatePath) {
    releaseFooter = await getTextFileOrThrow(
      sourceMode.sourceMode,
      releaseFooterTemplatePath,
      { provider, workspace: workspacePath },
    );
  } else if (releaseFooterTemplate) {
    releaseFooter = await resolveStringTemplateOrThrow(
      releaseFooterTemplate,
    );
  }

  let releaseBody: string;
  if (releaseBodyOverridePath) {
    releaseBody = await getTextFileOrThrow(
      sourceMode.releaseBodyOverridePath ?? sourceMode.sourceMode,
      releaseBodyOverridePath,
      { provider, workspace: workspacePath },
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

  return [releaseHeader, releaseBody, releaseFooter].join("\n\n");
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
  const { workspacePath, sourceMode } = inputs;

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
      sourceMode.sourceMode,
      releaseSectionEntryTemplatePath,
      { provider, workspace: workspacePath },
    )
    : releaseSectionEntryTemplate;

  const breakingSectionEntryTemplate = releaseBreakingSectionEntryTemplatePath
    ? await getTextFileOrThrow(
      sourceMode.sourceMode,
      releaseBreakingSectionEntryTemplatePath,
      { provider, workspace: workspacePath },
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
