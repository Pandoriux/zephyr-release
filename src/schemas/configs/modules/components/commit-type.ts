import * as v from "@valibot/valibot";

export const CommitTypeSchema = v.object({
  type: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(),
    v.metadata({ description: "Commit type name." }),
  ),
  section: v.pipe(
    v.optional(v.string(), ""),
    v.metadata({
      description:
        "Changelog section heading for this commit type. When empty, `type` value is used.\n" +
        'Default: ""',
    }),
  ),
  hidden: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description:
        "Exclude this commit type from changelog generation (does not affect version bump calculation).\n" +
        "Default: false",
    }),
  ),
});

type _CommitTypeInput = v.InferInput<typeof CommitTypeSchema>;
type _CommitTypeOutput = v.InferOutput<typeof CommitTypeSchema>;
