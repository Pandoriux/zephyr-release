import * as v from "@valibot/valibot";

export const PullRequestConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Enable/disable pull request creation. If disabled, version changes, changelog, tags, and releases"
          + "will be committed and created directly."
          + "\nDefault: `true`.",
      }),
    ),

    name: v.pipe(
      v.optional(v.string()),
      v.metadata({ description: "Project name used in pull requests." }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to pull requests.",
  }),
);

type _PullRequestConfigInput = v.InferInput<typeof PullRequestConfigSchema>;
type _PullRequestConfigOutput = v.InferOutput<typeof PullRequestConfigSchema>;
