import * as v from "@valibot/valibot";

export const CommitTypeSchema = v.array(v.object({
  type: v.pipe(
    v.string(),
    v.nonEmpty(),
    v.metadata({ description: "Commit type." }),
  ),
  section: v.pipe(
    v.optional(v.string(), ""),
    v.metadata({
      description: "Changelog section heading for this commit type.",
    }),
  ),
  changelogHidden: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description: "Exclude this commit type from changelog generation.",
    }),
  ),
}));

type _CommitTypeInput = v.InferInput<typeof CommitTypeSchema>;
type _CommitTypeOutput = v.InferOutput<typeof CommitTypeSchema>;
