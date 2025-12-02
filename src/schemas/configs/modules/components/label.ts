import * as v from "@valibot/valibot";

export const LabelSchema = v.object({
  name: v.string(),
  description: v.optional(v.string(), ""),
  color: v.pipe(
    v.optional(v.pipe(v.string(), v.nonEmpty()), "ededed"),
    v.metadata({
      description:
        "The hexadecimal color code for the label, without the leading #.\n" +
        "Default: `ededed`",
    }),
  ),
});

type _LabelInput = v.InferInput<typeof LabelSchema>;
type _LabelOutput = v.InferOutput<typeof LabelSchema>;
