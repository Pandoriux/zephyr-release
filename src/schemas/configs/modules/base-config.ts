import * as v from "@valibot/valibot";
import { TimeZoneSchema } from "./components/timezone.ts";
import { CommitTypeSchema } from "./components/commit-type.ts";
import { VersionFileSchema } from "./components/version-file.ts";
import { CommandHookSchema } from "./components/command-hook.ts";
import { SEMVER_REGEX } from "../../../constants/semver.ts";
import { DEFAULT_COMMIT_TYPES } from "../../../constants/defaults/commit.ts";
import { transformObjKeyToKebabCase } from "../../../utils/transformers/object.ts";
import { trimNonEmptyStringSchema } from "../../string.ts";

export const BaseConfigSchema = v.object({
  name: v.pipe(
    v.optional(v.pipe(v.string(), v.trim())),
    v.metadata({
      description: "Project name, available in string templates as {{ name }}.",
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
        "Pre/post command lists to run around the main operation. Each command runs from the repository root.\n" +
        "Available variables that cmds can use: [link-insert-later]",
    }),
  ),

  customStringPatterns: v.pipe(
    v.optional(
      v.record(trimNonEmptyStringSchema, v.unknown()),
    ),
    v.metadata({
      description:
        "Custom string patterns to use in templates. The key is the pattern, available as '{{<key>}}' while " +
        "the resolved value is the key value.\n" +
        "Normally, these should be set dynamically through config override.",
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
    v.union([
      VersionFileSchema,
      v.pipe(v.array(VersionFileSchema), v.nonEmpty()),
    ]),
    v.transform((input) => Array.isArray(input) ? input : [input]),
    v.metadata({
      description:
        "Version file(s). Accepts a single file object or an array of file objects. If a single object, it becomes the " +
        "primary file. If arrays, the first file with `primary: true` becomes the primary; if none are marked, " +
        "the first file in the array will be used.\n" +
        "About primary file: https://github.com/Pandoriux/zephyr-release/blob/main/docs/config-options.md#version-files-required",
    }),
  ),

  localFilesToCommit: v.pipe(
    v.optional(
      v.union([
        trimNonEmptyStringSchema,
        v.pipe(
          v.array(trimNonEmptyStringSchema),
          v.nonEmpty(),
        ),
      ]),
    ),
    v.transform((input) => {
      if (input !== undefined) return Array.isArray(input) ? input : [input];
      return input;
    }),
    v.metadata({
      description:
        'Additional local files to include in the commit. Accepts "ALL" options or an array of paths/globs. ' +
        "Paths are relative to the repo root.",
      examples: ["ALL", ["some/path"], ["src/release-artifacts/*"]],
    }),
  ),

  commitTypes: v.pipe(
    v.optional(
      v.pipe(v.array(CommitTypeSchema), v.nonEmpty()),
      DEFAULT_COMMIT_TYPES,
    ),
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
        trimNonEmptyStringSchema,
        v.pipe(v.array(trimNonEmptyStringSchema), v.nonEmpty()),
      ]),
      "ALL",
    ),
    v.transform((input) => Array.isArray(input) ? input : [input]),
    v.metadata({
      description:
        "List of commit type(s) allowed to trigger 'release-as'. Accepts single or array of strings.\n" +
        'Use "ALL" to accept any commit type; use "BASE" to use the list defined in `commitTypes`. You can combine "BASE" with other types (for example: ["BASE","docs"]).\n' +
        "About 'release-as': https://github.com/Pandoriux/zephyr-release?tab=readme-ov-file#force-a-specific-version \n" +
        'Default: "ALL"',
      examples: [["BASE", "chore", "ci", "cd"]],
    }),
  ),
});

type _BaseConfigInput = v.InferInput<typeof BaseConfigSchema>;
type _BaseConfigOutput = v.InferOutput<typeof BaseConfigSchema>;
