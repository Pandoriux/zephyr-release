import * as v from "@valibot/valibot";
import { LabelSchema } from "./components/label.ts";
import { CommandHookSchema } from "./components/command-hook.ts";
import { CoreLabelSchema } from "./components/core-label.ts";
import { AdditionalLabelSchema } from "./components/additional-label.ts";
import {
  DEFAULT_PULL_REQUEST_BODY_PATTERN,
  DEFAULT_PULL_REQUEST_FOOTER_PATTERN,
  DEFAULT_PULL_REQUEST_HEADER_PATTERN,
  DEFAULT_PULL_REQUEST_TITLE_PATTERN,
} from "../../../constants/defaults/string-pattern.ts";
import {
  DEFAULT_LABEL_ON_CLOSE,
  DEFAULT_LABEL_ON_CREATE,
} from "../../../constants/defaults/label.ts";
import { transformObjKeyToKebabCase } from "../../../utils/transformers/object.ts";

export const PullRequestConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Enable/disable pull request. If disabled, version changes, changelog, tags, and releases " +
          "will be committed and created directly.\n" +
          "Default: true",
      }),
    ),
    commandHook: v.pipe(
      v.optional(CommandHookSchema),
      v.metadata({
        description:
          "Pre/post command lists to run around the pull request operation. Each command runs from the repository root.",
      }),
    ),

    branchNamePattern: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        "release/zephyr-release",
      ),
      v.metadata({
        description: "Pattern for branch name that Zephyr Release uses.\n" +
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

    titlePattern: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        DEFAULT_PULL_REQUEST_TITLE_PATTERN,
      ),
      v.metadata({
        description: "Pattern for pull request title.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_TITLE_PATTERN)}`,
      }),
    ),
    headerPattern: v.pipe(
      v.optional(
        v.union([
          v.pipe(v.string(), v.trim()),
          v.array(v.pipe(v.string(), v.trim())),
        ]),
        DEFAULT_PULL_REQUEST_HEADER_PATTERN,
      ),
      v.metadata({
        description:
          "Pattern for pull request header. If an array is provided, one will be randomly chosen.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_HEADER_PATTERN)}`,
      }),
    ),
    bodyPattern: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim()),
        DEFAULT_PULL_REQUEST_BODY_PATTERN,
      ),
      v.metadata({
        description: "Pattern for pull request body.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_BODY_PATTERN)}`,
      }),
    ),
    bodyPatternPath: v.pipe(
      v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      v.metadata({
        description:
          "Path to text file containing pull request body pattern. Overrides body pattern if both are provided.",
      }),
    ),
    footerPattern: v.pipe(
      v.optional(
        v.pipe(v.string(), v.trim()),
        DEFAULT_PULL_REQUEST_FOOTER_PATTERN,
      ),
      v.metadata({
        description: "Pattern for pull request footer.\n" +
          `Default: ${JSON.stringify(DEFAULT_PULL_REQUEST_FOOTER_PATTERN)}`,
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to pull requests.",
  }),
);

type _PullRequestConfigInput = v.InferInput<typeof PullRequestConfigSchema>;
type _PullRequestConfigOutput = v.InferOutput<typeof PullRequestConfigSchema>;
