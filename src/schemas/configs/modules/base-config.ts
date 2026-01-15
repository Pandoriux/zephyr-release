import * as v from "@valibot/valibot";
import { TimeZoneSchema } from "./components/timezone.ts";
import { CommitTypeSchema } from "./components/commit-type.ts";
import { VersionFileSchema } from "./components/version-file.ts";
import { CommandHookSchema } from "./components/command-hook.ts";
import { SEMVER_REGEX } from "../../../constants/semver.ts";
import { DEFAULT_COMMIT_TYPES } from "../../../constants/defaults/commit.ts";
import { transformObjKeyToKebabCase } from "../../../utils/transformers/object.ts";

export const BaseConfigSchema = v.object({
  name: v.pipe(
    v.optional(v.pipe(v.string(), v.trim())),
    v.metadata({
      description: "Project name, available in string templates as ${name}.",
    }),
  ),
  timeZone: v.pipe(
    v.optional(TimeZoneSchema, "UTC"),
    v.metadata({
      description:
        "IANA timezone used to display times, available in string templates as ${timeZone}.\n" +
        'Default: "UTC"',
    }),
  ),
  commandHook: v.pipe(
    v.optional(CommandHookSchema),
    v.metadata({
      description:
        "Pre/post command lists to run around the main operation. Each command runs from the repository root.",
    }),
  ),

  initialVersion: v.pipe(
    v.optional(v.pipe(v.string(), v.regex(SEMVER_REGEX)), "0.1.0"),
    v.metadata({
      description:
        "Initial SemVer version applied when no existing version is found.\n" +
        'Default: "0.1.0"',
    }),
  ),
  versionFiles: v.pipe(
    v.union([VersionFileSchema, v.pipe(v.array(VersionFileSchema), v.nonEmpty())]),
    v.metadata({
      description:
        "Version file(s). Accepts a single file object or an array of file objects. If a single object, it becomes the " +
        "primary file. If arrays, the first file with `primary: true` becomes the primary; if none are marked, " +
        "the first file in the array will be used.\n" +
        "About primary file: link-to-be-insert-later",
    }),
  ),

  commitTypes: v.pipe(
    v.optional(v.pipe(v.array(CommitTypeSchema), v.nonEmpty()), DEFAULT_COMMIT_TYPES),
    v.metadata({
      description:
        "List of commit types used for version calculation and changelog generation.\n" +
        `Default: ${
          JSON.stringify(
            transformObjKeyToKebabCase(DEFAULT_COMMIT_TYPES),
            null,
            2,
          )
        }`,
    }),
  ),

  allowReleaseAs: v.pipe(
    v.optional(
      v.union([
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        v.pipe(v.array(v.pipe(v.string(), v.trim(), v.nonEmpty())), v.nonEmpty()),
      ]),
      "ALL",
    ),
    v.metadata({
      description:
        "List of commit type(s) allowed to trigger 'release-as'. Accepts single or array of strings.\n" +
        'Use "ALL" to accept any commit type; use "BASE" to use the list defined in `commitTypes`. You can combine "BASE" with other types (for example: ["BASE","docs"]).\n' +
        "About 'release-as': [links]\n" +
        'Default: "ALL"',
      examples: [["BASE", "chore", "ci", "cd"]],
    }),
  ),
});

type _BaseConfigInput = v.InferInput<typeof BaseConfigSchema>;
type _BaseConfigOutput = v.InferOutput<typeof BaseConfigSchema>;
