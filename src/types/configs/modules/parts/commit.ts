import * as v from "@valibot/valibot";

export const CommitTypeSchema = v.array(v.object({
  type: v.pipe(v.string(), v.nonEmpty()),
  title: v.optional(v.string(), ""),
  hidden: v.optional(v.boolean(), false),
}));

type _CommitTypeInput = v.InferInput<typeof CommitTypeSchema>;
type _CommitTypeOutput = v.InferOutput<typeof CommitTypeSchema>;
