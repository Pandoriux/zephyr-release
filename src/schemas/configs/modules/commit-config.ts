import * as v from "@valibot/valibot";
import {
  DEFAULT_COMMIT_HEADER_TEMPLATE,
} from "../../../constants/defaults/string-templates.ts";
import { trimNonEmptyStringSchema } from "../../string.ts";

export const CommitConfigSchema = v.pipe(
  v.object({
    headerTemplate: v.pipe(
      v.optional(trimNonEmptyStringSchema, DEFAULT_COMMIT_HEADER_TEMPLATE),
      v.metadata({
        description:
          "String template for commit header, using with string patterns like {{ version }}. You can optionally include a " +
          "CI skip token here (or body/footer) to prevent downstream pipeline runs (e.g., `[skip ci]` or `[ci skip]` " +
          "for GitHub, GitLab, and Bitbucket).\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_COMMIT_HEADER_TEMPLATE)}`,
      }),
    ),
    headerTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing commit header template. Overrides `headerTemplate` when both are provided.\n" +
          "To customize whether this file is fetched locally or remotely, see source mode: https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional",
      }),
    ),

    bodyTemplate: v.pipe(
      v.optional(v.string()),
      v.metadata({
        description:
          "String template for commit body, using with string patterns like {{ changelogRelease }}. You can optionally include a " +
          "CI skip token here (or header/footer) to prevent downstream pipeline runs (e.g., `[skip ci]` or `[ci skip]` " +
          "for GitHub, GitLab, and Bitbucket).\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n",
      }),
    ),
    bodyTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing commit body template. Overrides `bodyTemplate` when both are provided.\n" +
          "To customize whether this file is fetched locally or remotely, see source mode: https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional",
      }),
    ),

    footerTemplate: v.pipe(
      v.optional(v.string()),
      v.metadata({
        description:
          "String template for commit footer, using with string patterns. You can optionally include a " +
          "CI skip token here (or header/body) to prevent downstream pipeline runs (e.g., `[skip ci]` or `[ci skip]` " +
          "for GitHub, GitLab, and Bitbucket).\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n",
      }),
    ),
    footerTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing commit footer template. Overrides `footerTemplate` when both are provided.\n" +
          "To customize whether this file is fetched locally or remotely, see source mode: https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional",
      }),
    ),

    localFilesToCommit: v.pipe(
      v.optional(
        v.union([
          trimNonEmptyStringSchema,
          v.pipe(v.array(trimNonEmptyStringSchema), v.nonEmpty()),
        ]),
      ),
      v.transform((input) => {
        if (input !== undefined) {
          return Array.isArray(input) ? input : [input];
        }
        return input;
      }),
      v.metadata({
        description:
          "Additional changed local files to include in the commit. Accepts a path or an array of paths/globs. " +
          'Paths are relative to the repo root. To include all changed files, use a glob such as "**/*".',
        examples: [["some/path"], ["src/release-artifacts/*"], ["**/*"]],
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to commits.",
  }),
);

type _CommitConfigInput = v.InferInput<typeof CommitConfigSchema>;
export type CommitConfigOutput = v.InferOutput<typeof CommitConfigSchema>;
