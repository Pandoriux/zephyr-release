import * as v from "@valibot/valibot";
import { TimeZoneSchema } from "./parts/timeZone.ts";
import { CommitTypeSchema } from "./parts/commit.ts";
import { SEMVER_REGEX } from "../../../constants/regex.ts";
import { DEFAULT_COMMIT_TYPES } from "../../../constants/commit.ts";

export const BaseConfigSchema = v.object({
  name: v.pipe(
    v.optional(v.string(), ""),
    v.metadata({ description: "Project name." }),
  ),
  timeZone: v.pipe(
    v.optional(TimeZoneSchema, "UTC"),
    v.metadata({
      description: "IANA timezone used to display times. Default: `UTC`.",
    }),
  ),

  commitTypes: v.pipe(
    v.optional(CommitTypeSchema, DEFAULT_COMMIT_TYPES),
    v.metadata({
      description:
        "List of commit types used for version calculation and changelog generation. Default: [].",
    }),
  ),

  initialVersion: v.pipe(
    v.optional(v.pipe(v.string(), v.regex(SEMVER_REGEX)), "0.1.0"),
    v.metadata({
      description:
        "Initial SemVer version applied when no existing version is found. Default: `0.1.0`",
    }),
  ),
});

type _BaseConfigInput = v.InferInput<typeof BaseConfigSchema>;
type _BaseConfigOutput = v.InferOutput<typeof BaseConfigSchema>;
