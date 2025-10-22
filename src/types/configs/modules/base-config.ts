import * as v from "@valibot/valibot";
import { TimeZoneSchema } from "./parts/timezone.ts";
import { CommitTypeSchema } from "./parts/commit-type.ts";
import { SEMVER_REGEX } from "../../../constants/regex.ts";
import { DEFAULT_COMMIT_TYPES } from "../../../constants/defaults/commit.ts";

export const BaseConfigSchema = v.object({
  name: v.pipe(
    v.optional(v.string(), ""),
    v.metadata({
      description: "Project name, available in string pattern as ${name}.",
    }),
  ),
  timeZone: v.pipe(
    v.optional(TimeZoneSchema, "UTC"),
    v.metadata({
      description:
        "IANA timezone used to display times, available in string pattern as ${timeZone}."
        + "\nDefault: `UTC`.",
    }),
  ),

  commitTypes: v.pipe(
    v.optional(v.array(CommitTypeSchema), DEFAULT_COMMIT_TYPES),
    v.metadata({
      description:
        "List of commit types used for version calculation and changelog generation."
        + "\nDefault: `[! (breaking), feat, fix, perf, revert]`.",
    }),
  ),

  initialVersion: v.pipe(
    v.optional(v.pipe(v.string(), v.regex(SEMVER_REGEX)), "0.1.0"),
    v.metadata({
      description:
        "Initial SemVer version applied when no existing version is found."
        + "\nDefault: `0.1.0`",
    }),
  ),
});

type _BaseConfigInput = v.InferInput<typeof BaseConfigSchema>;
type _BaseConfigOutput = v.InferOutput<typeof BaseConfigSchema>;
