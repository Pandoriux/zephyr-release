import * as v from "@valibot/valibot";
import { FileFormatsWithAuto } from "../../../../constants/file-formats.ts";
import { VersionFileExtractorsWithAuto } from "../../../../constants/version-file-options.ts";
import { trimNonEmptyStringSchema } from "../../../string.ts";

export const VersionFileSchema = v.object({
  path: v.pipe(
    trimNonEmptyStringSchema,
    v.metadata({
      description:
        "Path to the version file, relative to the project root.\n" +
        "To customize whether this file is fetched locally or remotely, see source mode: https://github.com/Pandoriux/zephyr-release/blob/main/docs/input-options.md#source-mode-optional",
    }),
  ),
  format: v.pipe(
    v.optional(v.enum(FileFormatsWithAuto), "auto"),
    v.metadata({
      description:
        'Defines the file format. Allowed values: "auto", "json", "jsonc", "json5", "yaml", "toml", "txt".\n' +
        'Default: "auto"',
    }),
  ),
  extractor: v.pipe(
    v.optional(v.enum(VersionFileExtractorsWithAuto), "auto"),
    v.metadata({
      description:
        "Defines how to extract the version from the parsed file.\n" +
        'Default: "auto"',
    }),
  ),
  selector: v.pipe(
    trimNonEmptyStringSchema,
    v.metadata({
      description:
        "Defines how to locate the version field, depends on `extractor`.",
    }),
  ),
  primary: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description:
        "Marks this file as the primary source of truth for the current version.",
    }),
  ),
});

type _VersionFileInput = v.InferInput<typeof VersionFileSchema>;
export type VersionFileOutput = v.InferOutput<typeof VersionFileSchema>;
