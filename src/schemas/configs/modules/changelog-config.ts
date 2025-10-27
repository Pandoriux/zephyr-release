import * as v from "@valibot/valibot";
import {
  DEFAULT_CHANGELOG_BODY_PATTERN,
  DEFAULT_CHANGELOG_HEADING_PATTERN,
} from "../../../constants/defaults/string-pattern.ts";

export const ChangelogConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Enable/disable changelog. When disabled, changelogs are still generated for pull requests, releases and string pattern "
          + "but they won't be written to file."
          + "\nDefault: `true`.",
      }),
    ),

    contentOverride: v.pipe(
      v.optional(v.string(), ""),
      v.metadata({
        description:
          "User-provided changelog content, available in string pattern as `${changelogContent}`. If set, completely skips the "
          + "built-in generation process and uses this value as the changelog content. Should only be set dynamically "
          + "in workflow input, not json config.",
      }),
    ),
    filePath: v.pipe(
      v.optional(v.string(), "CHANGELOG.md"),
      v.metadata({
        description:
          "Path to the file where the generated changelog will be written to, relative to the project root."
          + "\nDefault: `CHANGELOG.md`",
      }),
    ),
    headingPattern: v.pipe(
      v.optional(v.string(), DEFAULT_CHANGELOG_HEADING_PATTERN),
      v.metadata({
        description: "Pattern for changelog heading.",
      }),
    ),
    bodyPattern: v.pipe(
      v.optional(v.string(), DEFAULT_CHANGELOG_BODY_PATTERN),
      v.metadata({
        description: "Pattern for changelog body.",
      }),
    ),
    bodyPatternPath: v.pipe(
      v.optional(v.string(), ""),
      v.metadata({
        description:
          "Path to text file containing changelog body pattern. Overrides body pattern if both are provided.",
      }),
    ),
  }),
  v.metadata({
    description:
      "Configuration specific to changelogs. All generated changelog lines are available in string pattern as ${changelog}",
  }),
);

type _ChangelogConfigInput = v.InferInput<typeof ChangelogConfigSchema>;
type _ChangelogConfigOutput = v.InferOutput<typeof ChangelogConfigSchema>;
