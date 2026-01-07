import * as v from "@valibot/valibot";
import { CommandHookSchema } from "./components/command-hook.ts";
import {
  DEFAULT_CHANGELOG_BODY_PATTERN,
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
          "User-provided changelog content body, available in string templates as ${changelogContentBody}. If set, completely " +
          "skips the built-in generation process and uses this value as the content. Should only be set dynamically, not " +
          "in static config.",
      }),
    ),

    headerTemplate: v.pipe(
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
    headerTemplatePath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing changelog file header. Overrides `headerTemplate` when both are provided.",
      }),
    ),
    footerTemplate: v.pipe(
      v.optional(v.pipe(v.string(), v.trim())),
      v.metadata({
        description:
          "String template for changelog file footer, using with string patterns like ${version}. Placed below any changelog content section.",
      }),
    ),
    footerTemplatePath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing changelog file footer. Overrides `footerTemplate` when both are provided.",
      }),
    ),

    headingTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_CHANGELOG_HEADING_PATTERN,
      ),
      v.metadata({
        description: "String template for heading of a changelog content section, using with string patterns like ${tagName}.\n" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_HEADING_PATTERN)}`,
      }),
    ),
    bodyTemplate: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_CHANGELOG_BODY_PATTERN,
      ),
      v.metadata({
        description: "String template for body of a changelog content section, using with string patterns like ${changelogContentBody}.\n" +
          `Default: ${JSON.stringify(DEFAULT_CHANGELOG_BODY_PATTERN)}`,
      }),
    ),
    bodyTemplatePath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing body of a changelog content section. Overrides `bodyTemplate` when both are provided.",
      }),
    ),
  }),
  v.metadata({
    description:
      "Configuration specific to changelogs. All generated changelog content are available in string templates as " +
      "${changelogContent} (heading + body) or ${changelogContentBody} (body only).",
  }),
);

type _ChangelogConfigInput = v.InferInput<typeof ChangelogConfigSchema>;
type _ChangelogConfigOutput = v.InferOutput<typeof ChangelogConfigSchema>;
