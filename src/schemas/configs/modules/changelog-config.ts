import * as v from "@valibot/valibot";
import { CommandHookSchema } from "./components/command-hook.ts";
import {
  DEFAULT_CHANGELOG_BODY_PATTERN,
  DEFAULT_CHANGELOG_HEADER_PATTERN,
  DEFAULT_CHANGELOG_HEADING_PATTERN,
} from "../../../constants/defaults/string-pattern.ts";

export const ChangelogConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Enable/disable changelog. When disabled, changelogs are still generated for pull requests, releases and string " +
          "pattern but they won't be written to file.\n" +
          "Default: true",
      }),
    ),
    commandHook: v.pipe(
      v.optional(CommandHookSchema),
      v.metadata({
        description:
          "Pre/post command lists to run around the changelog operation. Each command runs from the repository root.",
      }),
    ),

    contentBodyOverride: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "User-provided changelog content body, available in string pattern as ${changelogContentBody}. If set, completely " +
          "skips the built-in generation process and uses this value as the content. Should only be set dynamically, not " +
          "in static config.",
      }),
    ),

    path: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty()), "CHANGELOG.md"),
      v.metadata({
        description:
          "Path to the file where the generated changelog will be written to, relative to the project root.\n" +
          'Default: "CHANGELOG.md"',
      }),
    ),

    headerPattern: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim()),
        DEFAULT_CHANGELOG_HEADER_PATTERN,
      ),
      v.metadata({
        description:
          "Pattern for changelog file header. Placed above any changelog content sections.\n" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_HEADER_PATTERN)}`,
      }),
    ),
    headerPatternPath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing changelog file header. Overrides `headerPattern` when both are provided.",
      }),
    ),
    footerPattern: v.pipe(
      v.optional(v.pipe(v.string(), v.trim())),
      v.metadata({
        description:
          "Pattern for changelog file footer. Placed below any changelog content section.",
      }),
    ),
    footerPatternPath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing changelog file footer. Overrides `footerPattern` when both are provided.",
      }),
    ),

    headingPattern: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_CHANGELOG_HEADING_PATTERN,
      ),
      v.metadata({
        description: "Pattern for heading of a changelog content section.\n" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_HEADING_PATTERN)}`,
      }),
    ),
    bodyPattern: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_CHANGELOG_BODY_PATTERN,
      ),
      v.metadata({
        description: "Pattern for body of a changelog content section.\n" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_BODY_PATTERN)}`,
      }),
    ),
    bodyPatternPath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing body of a changelog content section. Overrides `bodyPattern` when both are provided.",
      }),
    ),
  }),
  v.metadata({
    description:
      "Configuration specific to changelogs. All generated changelog content are available in string pattern as " +
      "${changelogContent} (heading + body) or ${changelogContentBody} (body only).",
  }),
);

type _ChangelogConfigInput = v.InferInput<typeof ChangelogConfigSchema>;
type _ChangelogConfigOutput = v.InferOutput<typeof ChangelogConfigSchema>;
