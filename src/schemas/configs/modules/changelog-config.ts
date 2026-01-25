import * as v from "@valibot/valibot";
import {
  DEFAULT_CHANGELOG_ENTRY_PATTERN,
  DEFAULT_CHANGELOG_HEADER_PATTERN,
  DEFAULT_CHANGELOG_HEADING_PATTERN,
} from "../../../constants/defaults/string-pattern.ts";

export const ChangelogConfigSchema = v.pipe(
  v.object({
    writeToFile: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Enable/disable writing changelog to file. When disabled, changelogs are still generated for pull requests, releases and string " +
          "templates.\n" +
          "Default: true",
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

    contentBodyOverride: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "User-provided changelog content body, available in string templates as ${changelogContentBody}. If set, completely " +
          "skips the built-in generation process and uses this value as the content. Should only be set dynamically, not " +
          "in static config.",
      }),
    ),
    contentBodyOverridePath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing changelog content body override, will take precedence over `contentBodyOverride`.",
      }),
    ),

    fileHeaderTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim()),
        DEFAULT_CHANGELOG_HEADER_PATTERN,
      ),
      v.metadata({
        description:
          "String template for changelog file header, using with string patterns like ${version}. Placed above any changelog content sections.\n" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_HEADER_PATTERN)}`,
      }),
    ),
    fileHeaderTemplatePath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing changelog file header. Overrides `fileHeaderTemplate` when both are provided.",
      }),
    ),
    fileFooterTemplate: v.pipe(
      v.optional(v.pipe(v.string(), v.trim())),
      v.metadata({
        description:
          "String template for changelog file footer, using with string patterns like ${version}. Placed below any changelog content section.",
      }),
    ),
    fileFooterTemplatePath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing changelog file footer. Overrides `fileFooterTemplate` when both are provided.",
      }),
    ),

    contentHeaderTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_CHANGELOG_HEADING_PATTERN,
      ),
      v.metadata({
        description:
          "String template for header of a changelog content section, using with string patterns like ${version}.\n" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_HEADING_PATTERN)}`,
      }),
    ),
    contentEntryTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_CHANGELOG_ENTRY_PATTERN,
      ),
      v.metadata({
        description:
          "String template for each entries in the changelog content body, using with fixed base and version string patterns.\n" +
          "Additionally, you can use a special set of dynamic patterns which is ${type}, ${scope}, ${formatScope}, ${desc}, ${body}, ${footer}, " +
          "${hash}.\n" +
          "About special patterns: [link-to-insert]" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_ENTRY_PATTERN)}`,
      }),
    ),
    contentFooterTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
      ),
      v.metadata({
        description:
          "String template for footer of a changelog content section, using with string patterns.",
      }),
    ),
  }),
  v.metadata({
    description:
      "Configuration specific to changelogs. All generated changelog content are available in string templates as " +
      "${changelogContent} (content header + body) or ${changelogContentBody} (body only).",
  }),
);

type _ChangelogConfigInput = v.InferInput<typeof ChangelogConfigSchema>;
export type ChangelogConfigOutput = v.InferOutput<typeof ChangelogConfigSchema>;
