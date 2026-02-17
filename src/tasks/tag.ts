import { TaggerDateOptions } from "../constants/tagger-date-options.ts";
import type { ReleaseConfigOutput } from "../schemas/configs/modules/release-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { TaggerRequest } from "../types/tag.ts";
import { getTextFileOrThrow } from "./file.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";

type CreateTagInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "workspacePath" | "sourceMode"
>;

interface CreateTagConfigParams {
  release: Pick<
    ReleaseConfigOutput,
    | "tagNameTemplate"
    | "tagMessageTemplate"
    | "tagMessageTemplatePath"
    | "tagger"
  >;
}

export async function createTagOrThrow(
  provider: PlatformProvider,
  inputs: CreateTagInputsParams,
  config: CreateTagConfigParams,
) {
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;
  const { release } = config;
  const {
    tagNameTemplate,
    tagMessageTemplate,
    tagMessageTemplatePath,
    tagger,
  } = release;

  let tagMessage: string | undefined;
  if (tagMessageTemplatePath) {
    const msgTemplate = await getTextFileOrThrow(
      sourceMode.releaseTagMessageTemplatePath ?? sourceMode.sourceMode,
      tagMessageTemplatePath,
      { provider, workspace: workspacePath, ref: triggerCommitHash },
    );
    tagMessage = await resolveStringTemplateOrThrow(msgTemplate);
  } else {
    tagMessage = await resolveStringTemplateOrThrow(tagMessageTemplate);
  }

  let taggerData: TaggerRequest | undefined;
  if (tagger) {
    let taggerDate: string | undefined;
    if (tagger.date) {
      switch (tagger.date) {
        case TaggerDateOptions.currentTime:
          taggerDate = new Date().toISOString();
          break;
        case TaggerDateOptions.commitDate: {
          const commitData = await provider.getCommit(triggerCommitHash);
          taggerDate = commitData.committer.date.toISOString();
          break;
        }
        case TaggerDateOptions.authorDate: {
          const commitData = await provider.getCommit(triggerCommitHash);
          taggerDate = commitData.author.date.toISOString();
          break;
        }

        default:
          taggerDate = new Date(tagger.date).toISOString();
          break;
      }
    }

    taggerData = {
      name: tagger.name,
      email: tagger.email,
      date: taggerDate,
    };
  }

  return await provider.createTagOrThrow(
    await resolveStringTemplateOrThrow(tagNameTemplate),
    triggerCommitHash,
    tagMessage,
    taggerData,
  );
}
