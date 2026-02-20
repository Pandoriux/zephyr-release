import type { ReleaseConfigOutput } from "../schemas/configs/modules/release-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { getTextFileOrThrow } from "./file.ts";
import { taskLogger } from "./logger.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";

type CreateReleaseInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "workspacePath" | "sourceMode"
>;

interface CreateReleaseConfigParams {
  release: Pick<
    ReleaseConfigOutput,
    | "tagNameTemplate"
    | "prerelease"
    | "draft"
    | "setLatest"
    | "titleTemplate"
    | "titleTemplatePath"
    | "bodyTemplate"
    | "bodyTemplatePath"
  >;
}

export async function createRelease(
  provider: PlatformProvider,
  inputs: CreateReleaseInputsParams,
  config: CreateReleaseConfigParams,
) {
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;
  const {
    tagNameTemplate,
    prerelease,
    draft,
    setLatest,
    titleTemplate,
    titleTemplatePath,
    bodyTemplate,
    bodyTemplatePath,
  } = config.release;

  let releaseNoteTitle: string | undefined;
  if (titleTemplatePath) {
    const releaseTitleTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[titleTemplatePath] ?? sourceMode.mode,
      titleTemplatePath,
      { provider, workspacePath, ref: triggerCommitHash },
    );
    releaseNoteTitle = await resolveStringTemplateOrThrow(releaseTitleTemplate);
  } else {
    releaseNoteTitle = await resolveStringTemplateOrThrow(titleTemplate);
  }

  let releaseNoteBody: string | undefined;
  if (bodyTemplatePath) {
    const releaseBodyTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[bodyTemplatePath] ?? sourceMode.mode,
      bodyTemplatePath,
      { provider, workspacePath, ref: triggerCommitHash },
    );
    releaseNoteBody = await resolveStringTemplateOrThrow(releaseBodyTemplate);
  } else {
    releaseNoteBody = await resolveStringTemplateOrThrow(bodyTemplate);
  }

  const createdRelease = await provider.createReleaseOrThrow(
    await resolveStringTemplateOrThrow(tagNameTemplate),
    releaseNoteTitle,
    releaseNoteBody,
    { prerelease, draft, setLatest },
  );
  taskLogger.info(`Release created: ${createdRelease.url}`);

  return createdRelease;
}
