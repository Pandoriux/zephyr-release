import { getTextFileOrThrow } from "./file.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";
import { TaggerDateOptions } from "../constants/release-tag-options.ts";
import type { TagConfigOutput } from "../schemas/configs/modules/tag-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { TaggerRequest } from "../types/tag.ts";

type CreateTagInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "workspacePath" | "sourceMode"
>;

interface CreateTagConfigParams {
  tag: Pick<
    TagConfigOutput,
    | "nameTemplate"
    | "type"
    | "messageTemplate"
    | "messageTemplatePath"
    | "tagger"
  >;
}

export async function createTagOrThrow(
  provider: PlatformProvider,
  targetCommitHash: string,
  inputs: CreateTagInputsParams,
  config: CreateTagConfigParams,
) {
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;
  const {
    nameTemplate,
    type,
    messageTemplate,
    messageTemplatePath,
    tagger,
  } = config.tag;

  let tagMessage: string | undefined;
  if (messageTemplatePath) {
    const msgTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[messageTemplatePath] ?? sourceMode.mode,
      messageTemplatePath,
      { provider, workspacePath: workspacePath, ref: triggerCommitHash },
    );
    tagMessage = await resolveStringTemplateOrThrow(msgTemplate);
  } else {
    tagMessage = await resolveStringTemplateOrThrow(messageTemplate);
  }

  let taggerData: TaggerRequest | undefined;
  if (tagger) {
    let taggerDate: string | undefined;
    if (tagger.date) {
      switch (tagger.date) {
        case TaggerDateOptions.now:
          taggerDate = new Date().toISOString();
          break;
        case TaggerDateOptions.commitDate: {
          const commitData = await provider.getCommit(targetCommitHash);
          taggerDate = commitData.committer.date.toISOString();
          break;
        }
        case TaggerDateOptions.authorDate: {
          const commitData = await provider.getCommit(targetCommitHash);
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
    await resolveStringTemplateOrThrow(nameTemplate),
    targetCommitHash,
    type,
    tagMessage,
    taggerData,
  );
}
