import * as v from "@valibot/valibot";

export const TagConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Enable/disable tag creation. If disabled, release will also be disabled."
          + "\nDefault: `true`.",
      }),
    ),

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
