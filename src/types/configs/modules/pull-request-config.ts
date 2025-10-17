import * as v from "@valibot/valibot";

export const PullRequestConfigSchema = v.pipe(
  v.object({
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
