import * as v from "@valibot/valibot";
import { CommandHookSchema } from "./components/command-hook.ts";
import { CoreLabelSchema } from "./components/core-label.ts";
import { AdditionalLabelSchema } from "./components/additional-label.ts";
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
          "Pre/post command lists to run around the pull request operation. Each command runs from the repository root.\n" +
          "Available variables that cmds can use: https://github.com/Pandoriux/zephyr-release/blob/main/docs/export-variables.md",
      }),
    ),

    branchNameTemplate: v.pipe(
      v.optional(trimNonEmptyStringSchema, "release/zephyr-release"),
      v.metadata({
        description:
          "String template for branch name that Zephyr Release uses.\n" +
          "Allowed patterns to use are: fixed base string patterns.\n" +
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
          "String template for pull request title, using with string patterns like {{ version }}.\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_TITLE_TEMPLATE)}`,
      }),
    ),
    titleTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing pull request title template. Overrides `titleTemplate` when both are provided.\n" +
          "To customize whether this file is fetched locally or remotely, see source mode: https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional",
      }),
    ),
    headerTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_PULL_REQUEST_HEADER_TEMPLATE),
      v.metadata({
        description:
          "String template for pull request header, using with string patterns like {{ version }}.\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_HEADER_TEMPLATE)}`,
      }),
    ),
    headerTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing pull request header template. Overrides `headerTemplate` when both are provided.\n" +
          "To customize whether this file is fetched locally or remotely, see source mode: https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional",
      }),
    ),
    bodyTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_PULL_REQUEST_BODY_TEMPLATE),
      v.metadata({
        description:
          "String template for pull request body, using with string patterns like {{ changelogRelease }}.\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_BODY_TEMPLATE)}`,
      }),
    ),
    bodyTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing pull request body template. Overrides `bodyTemplate` when both are provided.\n" +
          "To customize whether this file is fetched locally or remotely, see source mode: https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional",
      }),
    ),
    footerTemplate: v.pipe(
      v.optional(v.string(), DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE),
      v.metadata({
        description:
          "String template for pull request footer, using with string patterns.\n" +
          "Allowed patterns to use are: all fixed and dynamic string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE)}`,
      }),
    ),
    footerTemplatePath: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          "Path to text file containing pull request footer template. Overrides `footerTemplate` when both are provided.\n" +
          "To customize whether this file is fetched locally or remotely, see source mode: https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional",
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
