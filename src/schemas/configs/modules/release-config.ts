import * as v from "@valibot/valibot";
import { CommandsSchema } from "./components/commands.ts";
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
    commands: v.pipe(
      v.optional(CommandsSchema, {}),
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

    tagNamePattern: v.pipe(
      v.optional(v.pipe(v.string(), v.nonEmpty()), DEFAULT_TAG_NAME_PATTERN),
      v.metadata({
        description:
          "Pattern for tag name, available in string pattern as ${tagName}.\n" +
          `Default: ${JSON.stringify(DEFAULT_TAG_NAME_PATTERN)}`,
      }),
    ),

    titlePattern: v.pipe(
      v.optional(v.string(), DEFAULT_RELEASE_TITLE_PATTERN),
      v.metadata({
        description: "Pattern for release title.\n" +
          `Default: ${JSON.stringify(DEFAULT_RELEASE_TITLE_PATTERN)}`,
      }),
    ),
    bodyPattern: v.pipe(
      v.optional(v.string(), DEFAULT_RELEASE_BODY_PATTERN),
      v.metadata({
        description: "Pattern for release body.\n" +
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
