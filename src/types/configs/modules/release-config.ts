import * as v from "@valibot/valibot";

export const ReleaseConfigSchema = v.pipe(
  v.object({
    enabled: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description: "Enable/disable release creation."
          + "\nDefault: `true`.",
      }),
    ),

    name: v.pipe(
      v.optional(v.string()),
      v.metadata({ description: "Project name used in releases." }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to releases.",
  }),
);

type _ReleaseConfigInput = v.InferInput<typeof ReleaseConfigSchema>;
type _ReleaseConfigOutput = v.InferOutput<typeof ReleaseConfigSchema>;
