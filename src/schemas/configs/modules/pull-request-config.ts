import * as v from "@valibot/valibot";
import { CommandHookSchema } from "./components/command-hook.ts";
import { CoreLabelSchema } from "./components/core-label.ts";
import { AdditionalLabelSchema } from "./components/additional-label.ts";
import { filesToCommitOptions } from "../../../constants/files-to-commit-options.ts";
import {
  DEFAULT_PULL_REQUEST_BODY_TEMPLATE,
  DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE,
  DEFAULT_PULL_REQUEST_HEADER_TEMPLATE,
  DEFAULT_PULL_REQUEST_TITLE_TEMPLATE,
} from "../../../constants/defaults/string-templates.ts";
import { trimNonEmptyStringSchema } from "../../string.ts";

export const PullRequestConfigSchema = v.pipe(
  v.object({
    commandHook: v.pipe(
      v.optional(CommandHookSchema),
      v.metadata({
        description:
          "Pre/post command lists to run around the pull request operation. Each command runs from the repository root.",
      }),
    ),
    filesToCommit: v.pipe(
      v.optional(
        v.union([
          trimNonEmptyStringSchema,
          v.pipe(
            v.array(trimNonEmptyStringSchema),
            v.nonEmpty(),
          ),
        ]),
      ),
      v.transform((input) => {
        if (input) return Array.isArray(input) ? input : [input];
        return input;
      }),
      v.metadata({
        description:
          'Additional local files to include in the commit. Accepts "ALL" options or an array of paths/globs. ' +
          "Paths are relative to the repo root.",
        examples: ["ALL", ["some/path"], ["src/release-artifacts/*"]],
      }),
    ),

    branchNameTemplate: v.pipe(
      v.optional(trimNonEmptyStringSchema, "release/zephyr-release"),
      v.metadata({
        description:
          "String template for branch name that Zephyr Release uses.\n" +
          'Allowed patterns to use are: "${name}", "${namespace}", "${repository}"\n' +
          'Default: "release/zephyr-release"',
      }),
    ),

    label: v.pipe(
      v.optional(CoreLabelSchema, {}),
      v.metadata({
        description:
          "Core label used by Zephyr Release to track pull requests, managed exclusively by the tool. " +
          "These label should not be manually added or removed.",
      }),
    ),
    additionalLabel: v.pipe(
      v.optional(AdditionalLabelSchema, {}),
      v.metadata({
        description:
          "Additional labels to attach to pull requests, managed and supplied by you. " +
          "Unlike the core label, these labels are not automatically created if missing.",
      }),
    ),

    titleTemplate: v.pipe(
      v.optional(trimNonEmptyStringSchema, DEFAULT_PULL_REQUEST_TITLE_TEMPLATE),
      v.metadata({
        description:
          "String template for pull request title, using with string patterns like ${version}.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_TITLE_TEMPLATE)}`,
      }),
    ),
    headerTemplate: v.pipe(
      v.optional(
        v.union([v.string(), v.pipe(v.array(v.string()), v.nonEmpty())]),
        DEFAULT_PULL_REQUEST_HEADER_TEMPLATE,
      ),
      v.transform((input) => Array.isArray(input) ? input : [input]),
      v.metadata({
        description:
          "String template for pull request header, using with string patterns like ${version}. If an array is provided, one will be randomly chosen.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_HEADER_TEMPLATE)}`,
      }),
    ),
    bodyTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_PULL_REQUEST_BODY_TEMPLATE),
      v.metadata({
        description:
          "String template for pull request body, using with string patterns like ${changelogContent}.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_BODY_TEMPLATE)}`,
      }),
    ),
    bodyTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing pull request body template. Overrides body template if both are provided.",
      }),
    ),
    footerTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE),
      v.metadata({
        description:
          "String template for pull request footer, using with string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE)}`,
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to pull requests.",
  }),
);

type _PullRequestConfigInput = v.InferInput<typeof PullRequestConfigSchema>;
export type PullRequestConfigOutput = v.InferOutput<
  typeof PullRequestConfigSchema
>;
