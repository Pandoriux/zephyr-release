import * as v from "@valibot/valibot";

export const TagConfigSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.optional(v.string()),
      v.metadata({ description: "Project name used in tags." }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to tags.",
  }),
);

type _TagConfigInput = v.InferInput<typeof TagConfigSchema>;
type _TagConfigOutput = v.InferOutput<typeof TagConfigSchema>;
