import * as v from "@valibot/valibot";
import { TimeZoneSchema } from "../../timezone.ts";

export const PullRequestConfigSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.optional(v.string()),
      v.metadata({ description: "Project name used in pull requests." }),
    ),
    timeZone: v.pipe(
      v.optional(TimeZoneSchema),
      v.metadata({
        description:
          "IANA timezone used to display times in pull requests. Falls back to base config if not set.",
      }),
    ),
  }),
  v.metadata({
    description: "Configuration specific to pull requests.",
  }),
);

type _PullRequestConfigInput = v.InferInput<typeof PullRequestConfigSchema>;
type _PullRequestConfigOutput = v.InferOutput<typeof PullRequestConfigSchema>;
