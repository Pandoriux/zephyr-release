import * as v from "@valibot/valibot";
import { CommandHookSchema } from "./components/command-hook.ts";
import {
  DEFAULT_RELEASE_BODY_TEMPLATE,
  DEFAULT_RELEASE_TITLE_TEMPLATE,
  DEFAULT_TAG_NAME_TEMPLATE,
} from "../../../constants/defaults/string-templates.ts";
import { trimNonEmptyStringSchema } from "../../string.ts";

export const ReleaseConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description: "Enable/disable tag and release operation.\n" +
          "Default: true",
      }),
    ),
    commandHook: v.pipe(
      v.optional(CommandHookSchema),
      v.metadata({
        description:
          "Pre/post command lists to run around the release operation. Each command runs from the repository root.",
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

    titleTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_RELEASE_TITLE_TEMPLATE),
      v.metadata({
        description:
          "String template for release title, using with string patterns like {{ tagName }}.\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_RELEASE_TITLE_TEMPLATE)}`,
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
  }),
  v.metadata({
    description: "Configuration specific to tags and releases.",
  }),
);

type _ReleaseConfigInput = v.InferInput<typeof ReleaseConfigSchema>;
type _ReleaseConfigOutput = v.InferOutput<typeof ReleaseConfigSchema>;
