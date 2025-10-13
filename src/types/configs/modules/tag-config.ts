import * as v from "@valibot/valibot";
import { TimeZoneSchema } from "../../timezone.ts";

export const TagConfigSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.optional(v.string()),
      v.metadata({ description: "Project name used in tags." }),
    ),
    timeZone: v.pipe(
      v.optional(TimeZoneSchema),
      v.metadata({
        description:
          "IANA timezone used to display times in tags. Falls back to base config if not set.",
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to tags.",
  }),
);

type _TagConfigInput = v.InferInput<typeof TagConfigSchema>;
type _TagConfigOutput = v.InferOutput<typeof TagConfigSchema>;
