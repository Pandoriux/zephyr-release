import * as v from "@valibot/valibot";
import { TimeZoneSchema } from "../../timezone.ts";

export const ReleaseConfigSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.optional(v.string()),
      v.metadata({ description: "Project name used in releases." }),
    ),
    timeZone: v.pipe(
      v.optional(TimeZoneSchema),
      v.metadata({
        description:
          "IANA timezone used to display times in releases. Falls back to base config if not set.",
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to releases.",
  }),
);

type _ReleaseConfigInput = v.InferInput<typeof ReleaseConfigSchema>;
type _ReleaseConfigOutput = v.InferOutput<typeof ReleaseConfigSchema>;
