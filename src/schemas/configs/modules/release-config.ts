import * as v from "@valibot/valibot";
import { CommandHookSchema } from "./components/command-hook.ts";
import {
  DEFAULT_RELEASE_BODY_PATTERN,
  DEFAULT_RELEASE_TITLE_PATTERN,
  DEFAULT_TAG_NAME_PATTERN,
} from "../../../constants/defaults/string-pattern.ts";

export const ReleaseConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description: "Enable/disable tag and release.\n" +
          "Default: true",
      }),
    ),
    skipRelease: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description:
          "If enabled, only the tag will be created, no release will be made.\n" +
          "Default: false",
      }),
    ),
    commandHook: v.pipe(
      v.optional(CommandHookSchema),
      v.metadata({
        description:
          "Pre/post command lists to run around the release operation. Each command runs from the repository root.",
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
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_TAG_NAME_PATTERN,
      ),
      v.metadata({
        description:
          "String template for tag name, using with string patterns like ${version}. Available in string templates as ${tagName}.\n" +
          "Allowed patterns to use are: all fixed base string patterns ()\n" +
          `Default: ${JSON.stringify(DEFAULT_TAG_NAME_PATTERN)}`,
      }),
    ),

    titleTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_RELEASE_TITLE_PATTERN,
      ),
      v.metadata({
        description:
          "String template for release title, using with string patterns like ${tagName}.\n" +
          `Default: ${JSON.stringify(DEFAULT_RELEASE_TITLE_PATTERN)}`,
      }),
    ),
    bodyTemplate: v.pipe(
      v.optional(v.pipe(v.string(), v.trim()), DEFAULT_RELEASE_BODY_PATTERN),
      v.metadata({
        description:
          "String template for release body, using with string patterns like ${changelogContent}.\n" +
          `Default: ${JSON.stringify(DEFAULT_RELEASE_BODY_PATTERN)}`,
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to tags and releases.",
  }),
);

type _ReleaseConfigInput = v.InferInput<typeof ReleaseConfigSchema>;
type _ReleaseConfigOutput = v.InferOutput<typeof ReleaseConfigSchema>;
