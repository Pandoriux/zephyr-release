import * as v from "@valibot/valibot";
import {
  DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE,
  DEFAULT_CHANGELOG_RELEASE_HEADER_TEMPLATE,
  DEFAULT_CHANGELOG_SECTION_ENTRY_TEMPLATE,
} from "../../../constants/defaults/string-templates.ts";
import { trimNonEmptyStringSchema } from "../../string.ts";

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
      v.optional(trimNonEmptyStringSchema, "CHANGELOG.md"),
      v.metadata({
        description:
          "Path to the file where the generated changelog will be written to, relative to the project root.\n" +
          'Default: "CHANGELOG.md"',
      }),
    ),

    fileHeaderTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE),
      v.metadata({
        description:
          "String template for changelog file header, using with string patterns like ${version}. Placed above any changelog content.\n" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE)}`,
      }),
    ),
    fileHeaderTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing changelog file header. Overrides `fileHeaderTemplate` when both are provided.",
      }),
    ),
    fileFooterTemplate: v.pipe(
      v.optional(v.string()),
      v.metadata({
        description:
          "String template for changelog file footer, using with string patterns like ${version}. Placed below any changelog content.",
      }),
    ),
    fileFooterTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing changelog file footer. Overrides `fileFooterTemplate` when both are provided.",
      }),
    ),

    releaseHeaderTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.nonEmpty()),
        DEFAULT_CHANGELOG_RELEASE_HEADER_TEMPLATE,
      ),
      v.metadata({
        description:
          "String template for header of a changelog release, using with string patterns like {{ version }}.\n" +
          `Default: ${
            JSON.stringify(DEFAULT_CHANGELOG_RELEASE_HEADER_TEMPLATE)
          }`,
      }),
    ),
    releaseSectionEntryTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.nonEmpty()),
        DEFAULT_CHANGELOG_SECTION_ENTRY_TEMPLATE,
      ),
      v.metadata({
        description:
          "String template for each entries in the changelog release sections, using with fixed base and version string patterns. " +
          "Additionally, you can use a special set of dynamic patterns which are:\n" +
          "{{ hash }}, {{ type }}, {{ scope }}, {{ desc }}, {{ body }}, {{ footer }}, {{ isBreaking }}.\n" +
          "About special patterns: [link-to-insert]" +
          `Default: ${
            JSON.stringify(DEFAULT_CHANGELOG_SECTION_ENTRY_TEMPLATE)
          }`,
      }),
    ),
    releaseBreakingSectionHeadingTemplate: v.pipe(
      v.optional(v.string(), "⚠ BREAKING CHANGES"),
      v.metadata({
        description:
          "String template for heading of a changelog release BREAKING section, using with string patterns.",
      }),
    ),
    releaseBreakingSectionEntryTemplate: v.pipe(
      v.optional(v.pipe(v.string(), v.nonEmpty())),
      v.metadata({
        description:
          "Basically the same as `releaseSectionEntryTemplate`, but for breaking changes specifically. If not provided, falls back " +
          "to `releaseSectionEntryTemplate`",
      }),
    ),
    releaseFooterTemplate: v.pipe(
      v.optional(v.string()),
      v.metadata({
        description:
          "String template for footer of a changelog release, using with string patterns.",
      }),
    ),

    releaseBodyOverride: v.pipe(
      v.optional(v.pipe(v.string(), v.nonEmpty())),
      v.metadata({
        description:
          "User-provided changelog release body, available in string templates as {{ changelogReleaseBody }}. If set, completely " +
          "ignores the built-in generation and uses this value as the content. Should only be set dynamically, not " +
          "in static config.",
      }),
    ),
    releaseBodyOverridePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing changelog release body override, will take precedence over `releaseBodyOverride`.",
      }),
    ),
  }),
  v.metadata({
    description:
      "Configuration specific to changelogs. All generated changelog content are available in string templates as " +
      "{{ changelogRelease }} (release header + body) or {{ changelogReleaseHeader }} and {{ changelogReleaseBody }}.",
  }),
);

type _ChangelogConfigInput = v.InferInput<typeof ChangelogConfigSchema>;
export type ChangelogConfigOutput = v.InferOutput<typeof ChangelogConfigSchema>;
