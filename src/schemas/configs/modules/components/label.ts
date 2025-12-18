import * as v from "@valibot/valibot";

export const LabelSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
  description: v.optional(v.string(), ""),
  color: v.pipe(
    v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty()), "ededed"),
    v.metadata({
      description:
        "The hexadecimal color code for the label, without the leading #.\n" +
        'Default: "ededed"',
    }),
  ),
});

type _LabelInput = v.InferInput<typeof LabelSchema>;
type _LabelOutput = v.InferOutput<typeof LabelSchema>;
