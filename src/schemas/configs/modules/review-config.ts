import * as v from "@valibot/valibot";
import { trimNonEmptyStringSchema } from "../../string.ts";
import {
  DEFAULT_PULL_REQUEST_BODY_TEMPLATE,
  DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE,
  DEFAULT_PULL_REQUEST_HEADER_TEMPLATE,
  DEFAULT_PULL_REQUEST_TITLE_TEMPLATE,
  DEFAULT_WORKING_BRANCH_NAME_TEMPLATE,
} from "../../../constants/defaults/string-templates.ts";
import { AdditionalLabelSchema } from "./components/additional-label.ts";
import { CoreLabelSchema } from "./components/core-label.ts";

export const ReviewConfigSchema = v.pipe(
  v.object({
    draft: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description: "If enabled, the proposal will be created as draft.\n" +
          "Default: false",
      }),
    ),

    workingBranchNameTemplate: v.pipe(
      v.optional(
        trimNonEmptyStringSchema,
        DEFAULT_WORKING_BRANCH_NAME_TEMPLATE,
      ),
      v.metadata({
        description:
          "String template for branch name that Zephyr Release will use.\n" +
          "Allowed patterns to use are: fixed base string patterns.\n" +
          `Default: ${JSON.stringify(DEFAULT_WORKING_BRANCH_NAME_TEMPLATE)}`,
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

    assignees: v.pipe(
      v.optional(v.pipe(v.array(trimNonEmptyStringSchema), v.nonEmpty())),
      v.metadata({
        description:
          "A list of user identifiers to assign to the release proposal.\n" +
          "Use the platform's expected format (e.g., usernames).",
      }),
    ),
    reviewers: v.pipe(
      v.optional(v.pipe(v.array(trimNonEmptyStringSchema), v.nonEmpty())),
      v.metadata({
        description:
          "A list of user or team identifiers requested to review the release proposal.\n" +
          "Use the platform's expected format (e.g., usernames or team slugs).",
      }),
    ),
  }),
  v.metadata({
    description:
      'Configuration specific to the "review" execution `mode`. Defines how release proposals (such as Pull Requests) ' +
      "are generated, formatted, and tracked.",
  }),
);

type _ReviewConfigInput = v.InferInput<typeof ReviewConfigSchema>;
export type ReviewConfigOutput = v.InferOutput<typeof ReviewConfigSchema>;
