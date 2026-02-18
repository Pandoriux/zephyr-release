import * as v from "@valibot/valibot";
import { trimNonEmptyStringSchema } from "../../../string.ts";
import { TaggerDateOptions } from "../../../../constants/release-tag-options.ts";

export const TaggerSchema = v.object({
  name: v.pipe(
    trimNonEmptyStringSchema,
    v.metadata({
      description: "The name of the tag creator.",
    }),
  ),
  email: v.pipe(
    trimNonEmptyStringSchema,
    v.email(),
    v.metadata({ description: "The email of the tag creator." }),
  ),
  date: v.pipe(
    v.optional(trimNonEmptyStringSchema),
    v.metadata({
      description: "Override the Git tag timestamp.\n" +
        "Can be one of these options:\n" +
        "- 'current_time': The moment the operation creates the tag.\n" +
        "- 'commit_date': The Git committer date.\n" +
        "- 'author_date': The Git author date.\n" +
        "Or a specific ISO 8601 date string.\n" +
        "If omitted, defaults to the platform native behavior (recommended).",
      examples: [
        TaggerDateOptions.currentTime,
        TaggerDateOptions.commitDate,
        TaggerDateOptions.authorDate,
      ],
    }),
  ),
});

type _TaggerSchemaInput = v.InferInput<typeof TaggerSchema>;
type _TaggerSchemaOutput = v.InferOutput<typeof TaggerSchema>;
