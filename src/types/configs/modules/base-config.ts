import * as v from "@valibot/valibot";
import { TimeZoneSchema } from "../../timezone.ts";
import { SEMVER_REGEX } from "../../../constants/regex.ts";

export const BaseConfigSchema = v.object({
  name: v.pipe(
    v.optional(v.string(), ""),
    v.metadata({ description: "Project name." }),
  ),
  initialVersion: v.pipe(
    v.optional(v.pipe(v.string(), v.regex(SEMVER_REGEX)), "0.1.0"),
    v.metadata({
      description:
        "Initial SemVer version applied when no existing version is found.",
    }),
  ),
  timeZone: v.pipe(
    v.optional(TimeZoneSchema, "UTC"),
    v.metadata({
      description: "IANA timezone used to display times. Default: `UTC`.",
    }),
  ),
});

type _BaseConfigInput = v.InferInput<typeof BaseConfigSchema>;
type _BaseConfigOutput = v.InferOutput<typeof BaseConfigSchema>;
