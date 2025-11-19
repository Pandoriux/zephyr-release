import * as v from "@valibot/valibot";
import { LabelSchema } from "./components/label.ts";
import { CommandsSchema } from "./components/commands.ts";
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

export const PullRequestConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Enable/disable pull request. If disabled, version changes, changelog, tags, and releases "
          + "will be committed and created directly."
          + "\nDefault: `true`.",
      }),
    ),
    commands: v.pipe(
      v.optional(CommandsSchema, {}),
      v.metadata({
        description:
          "Pre/post command lists to run around the pull request operation. Each command runs from the repository root.",
      }),
    ),

    branchNamePattern: v.pipe(
      v.optional(v.pipe(v.string(), v.nonEmpty()), "release/zephyr-release"),
      v.metadata({
        description:
          "Pattern for branch name that Zephyr Release is gonna use.",
      }),
    ),

    labelsOnCreate: v.pipe(
      v.optional(
        v.union([LabelSchema, v.array(LabelSchema)]),
        DEFAULT_LABEL_ON_CREATE,
      ),
      v.metadata({
        description:
          "A label or an array of labels to add to the pull request when it is created",
      }),
    ),
    labelsOnClose: v.pipe(
      v.optional(
        v.union([LabelSchema, v.array(LabelSchema)]),
        DEFAULT_LABEL_ON_CLOSE,
      ),
      v.metadata({
        description:
          "A label or an array of labels to add to the pull request when it is closed and the release operation has completed.",
      }),
    ),

    titlePattern: v.pipe(
      v.optional(
        v.pipe(v.string(), v.nonEmpty()),
        DEFAULT_PULL_REQUEST_TITLE_PATTERN,
      ),
      v.metadata({
        description: "Pattern for pull request title.",
      }),
    ),
    headerPattern: v.pipe(
      v.optional(
        v.union([v.string(), v.array(v.string())]),
        DEFAULT_PULL_REQUEST_HEADER_PATTERN,
      ),
      v.metadata({
        description:
          "Pattern for pull request header. If an array is provided, it will randomly choose one from it.",
      }),
    ),
    bodyPattern: v.pipe(
      v.optional(v.string(), DEFAULT_PULL_REQUEST_BODY_PATTERN),
      v.metadata({
        description: "Pattern for pull request body.",
      }),
    ),
    bodyPatternPath: v.pipe(
      v.optional(v.string(), ""),
      v.metadata({
        description:
          "Path to text file containing pull request body pattern. Overrides body pattern if both are provided.",
      }),
    ),
    footerPattern: v.pipe(
      v.optional(v.string(), DEFAULT_PULL_REQUEST_FOOTER_PATTERN),
      v.metadata({
        description: "Pattern for pull request footer.",
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to pull requests.",
  }),
);

type _PullRequestConfigInput = v.InferInput<typeof PullRequestConfigSchema>;
type _PullRequestConfigOutput = v.InferOutput<typeof PullRequestConfigSchema>;
