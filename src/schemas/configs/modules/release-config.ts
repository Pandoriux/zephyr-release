import * as v from "@valibot/valibot";
import {
  DEFAULT_RELEASE_BODY_PATTERN,
  DEFAULT_RELEASE_TITLE_PATTERN,
  DEFAULT_TAG_NAME_PATTERN,
} from "../../../constants/defaults/string-pattern.ts";
import { CommandsSchema } from "./parts/commands.ts";

export const ReleaseConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description: "Enable/disable tag and release."
          + "\nDefault: `true`.",
      }),
    ),
    skipRelease: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description:
          "If enabled, only the tag will be created, no release will be made."
          + "\nDefault: `false`.",
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
        description: "If enabled, the release will be marked as prerelease."
          + "\nDefault: `false`.",
      }),
    ),
    draft: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description: "If enabled, the release will be created as draft."
          + "\nDefault: `false`.",
      }),
    ),

    tagNamePattern: v.pipe(
      v.optional(v.pipe(v.string(), v.nonEmpty()), DEFAULT_TAG_NAME_PATTERN),
      v.metadata({
        description:
          "Pattern for tag name, available in string pattern as `${tagName}`.",
      }),
    ),

    titlePattern: v.pipe(
      v.optional(v.string(), DEFAULT_RELEASE_TITLE_PATTERN),
      v.metadata({ description: "Pattern for release title." }),
    ),
    bodyPattern: v.pipe(
      v.optional(v.string(), DEFAULT_RELEASE_BODY_PATTERN),
      v.metadata({ description: "Pattern for release body." }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to tags and releases.",
  }),
);

type _ReleaseConfigInput = v.InferInput<typeof ReleaseConfigSchema>;
type _ReleaseConfigOutput = v.InferOutput<typeof ReleaseConfigSchema>;
