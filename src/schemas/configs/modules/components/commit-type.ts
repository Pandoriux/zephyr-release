import * as v from "@valibot/valibot";
import { trimNonEmptyStringSchema } from "../../../string.ts";

export const CommitTypeSchema = v.object({
  type: v.pipe(
    trimNonEmptyStringSchema,
    v.toLowerCase(),
    v.metadata({ description: "Commit type name." }),
  ),
  section: v.pipe(
    v.optional(trimNonEmptyStringSchema),
    v.metadata({
      description:
        "Changelog section heading for this commit type. When not provided, `type` value is used.\n",
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
