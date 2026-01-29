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
      | "releaseSectionEntryTemplate"
      | "releaseBreakingSectionHeadingTemplate"
      | "releaseBreakingSectionEntryTemplate"
      | "releaseFooterTemplate"
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
      // releaseSectionEntryTemplate,
      // releaseBreakingSectionHeadingTemplate,
      // releaseBreakingSectionEntryTemplate,
      releaseFooterTemplate,
      releaseBodyOverride,
      releaseBodyOverridePath,
    },
  } = config;

  const releaseHeader = await resolveStringTemplateOrThrow(
    releaseHeaderTemplate,
  );
  const releaseFooter = releaseFooterTemplate
    ? await resolveStringTemplateOrThrow(
      releaseFooterTemplate,
    )
    : undefined;

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
    releaseBody = await generateReleaseBody(resolvedCommits, config);
  }

  return [releaseHeader, releaseBody, releaseFooter].join("\n\n");
}

async function generateReleaseBody(
  resolvedCommits: ResolvedCommit[],
  config: GenerateChangelogReleaseConfigParams,
): Promise<string> {
  const {
    commitTypes,
    changelog: {
      releaseSectionEntryTemplate,
      releaseBreakingSectionHeadingTemplate,
      releaseBreakingSectionEntryTemplate,
    },
  } = config;

  // Section -> Commits
  const sectionGroups = new Map<string, string[]>();
  // Type -> Section
  const typeToSection = new Map<string, string>();

  const breakingSection = await resolveStringTemplateOrThrow(
    releaseBreakingSectionHeadingTemplate,
  );
  sectionGroups.set(breakingSection, []);

  for (const ct of commitTypes) {
    if (ct.hidden) continue;

    const sectionName = ct.section ?? toTitleCase(ct.type);
    typeToSection.set(ct.type, sectionName);

    if (!sectionGroups.has(sectionName)) {
      sectionGroups.set(sectionName, []);
    }
  }

  // Process Commits
  for (const commit of resolvedCommits) {
    const section = typeToSection.get(commit.type);
    if (!section) continue;

    const sectionContents = sectionGroups.get(section);
    if (!sectionContents) continue;

    const commitPatterns = createCommitExtraPatterns(commit);

    const commitStr = await resolveStringTemplateOrThrow(
      releaseSectionEntryTemplate,
      commitPatterns,
    );
    sectionContents.push(commitStr);

    if (commit.isBreaking) {
      const commitBreakingStr = releaseBreakingSectionEntryTemplate
        ? await resolveStringTemplateOrThrow(
          releaseBreakingSectionEntryTemplate,
          commitPatterns,
        )
        : commitStr;

      const breakingSectionContents = sectionGroups.get(breakingSection);
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
