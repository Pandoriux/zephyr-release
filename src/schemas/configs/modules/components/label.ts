import * as v from "@valibot/valibot";
import { trimNonEmptyStringSchema } from "../../../string.ts";

export const LabelSchema = v.object({
  name: trimNonEmptyStringSchema,
  description: v.optional(v.pipe(v.string(), v.trim())),
  color: v.pipe(
    v.optional(v.pipe(trimNonEmptyStringSchema, v.hexColor()), "#ededed"),
    v.metadata({
      description:
        "The hexadecimal color code for the label, in standard format with the leading #.\n" +
        'Default: "#ededed"',
    }),
  ),
});

type _LabelInput = v.InferInput<typeof LabelSchema>;
type _LabelOutput = v.InferOutput<typeof LabelSchema>;
