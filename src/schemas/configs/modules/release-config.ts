import * as v from "@valibot/valibot";
import { CommandHookSchema } from "./components/command-hook.ts";
import {
  DEFAULT_RELEASE_BODY_TEMPLATE,
  DEFAULT_RELEASE_TITLE_TEMPLATE,
  DEFAULT_TAG_MESSAGE_TEMPLATE,
  DEFAULT_TAG_NAME_TEMPLATE,
} from "../../../constants/defaults/string-templates.ts";
import { trimNonEmptyStringSchema } from "../../string.ts";
import { TaggerSchema } from "./components/tagger.ts";
import { TagTypeOptions } from "../../../constants/release-tag-options.ts";

export const ReleaseConfigSchema = v.pipe(
  v.object({
    commandHook: v.pipe(
      v.optional(CommandHookSchema),
      v.metadata({
        description:
          "Pre/post command lists to run around the release operation. Each command runs from the repository root.\n" +
          "Available variables that cmds can use: https://github.com/Pandoriux/zephyr-release/blob/main/docs/export-variables.md",
      }),
    ),

    tagNameTemplate: v.pipe(
      v.optional(trimNonEmptyStringSchema, DEFAULT_TAG_NAME_TEMPLATE),
      v.metadata({
        description:
          "String template for tag name, using with string patterns like {{ version }}. Available in string templates as " +
          "{{ tagName }}.\n" +
          "Allowed patterns to use are: fixed base and fixed version string patterns and dynamic patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_TAG_NAME_TEMPLATE)}`,
      }),
    ),
    tagType: v.pipe(
      v.optional(v.enum(TagTypeOptions), TagTypeOptions.annotated),
      v.metadata({
        description:
          "The type of Git tag to create, either annotated or lightweight. If annotated, a tag message is required.\n" +
          `Default: ${JSON.stringify(TagTypeOptions.annotated)}`,
      }),
    ),
    tagMessageTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_TAG_MESSAGE_TEMPLATE),
      v.metadata({
        description: "String template for the Git annotated tag message.\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_TAG_MESSAGE_TEMPLATE)}`,
      }),
    ),
    tagMessageTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing Git annotated tag message template. Overrides `tagMessageTemplate` when both are provided.",
      }),
    ),
    tagger: v.pipe(
      v.optional(TaggerSchema),
      v.metadata({
        description:
          "Custom identity and timestamp information for the Git tag. If omitted, defaults to the platform native behavior.",
      }),
    ),

    skipReleaseNote: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description:
          "If enabled, only the tag will be created, no release note will be made.\n" +
          "Default: false",
      }),
    ),
    prerelease: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description: "If enabled, the release will be marked as prerelease.\n" +
          "Default: false",
      }),
    ),
    draft: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description: "If enabled, the release will be created as draft.\n" +
          "Default: false",
      }),
    ),
    setLatest: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description: "If enabled, the release will be set as the latest release.\n" +
          "Default: true",
      }),
    ),

    titleTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_RELEASE_TITLE_TEMPLATE),
      v.metadata({
        description:
          "String template for release title, using with string patterns like {{ tagName }}.\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_RELEASE_TITLE_TEMPLATE)}`,
      }),
    ),
    titleTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing release title template. Overrides `titleTemplate` when both are provided.",
      }),
    ),
    bodyTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_RELEASE_BODY_TEMPLATE),
      v.metadata({
        description:
          "String template for release body, using with string patterns like {{ changelogRelease }}.\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_RELEASE_BODY_TEMPLATE)}`,
      }),
    ),
    bodyTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing release body template. Overrides `bodyTemplate` when both are provided.",
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to tags and releases.",
  }),
);

type _ReleaseConfigInput = v.InferInput<typeof ReleaseConfigSchema>;
export type ReleaseConfigOutput = v.InferOutput<typeof ReleaseConfigSchema>;
