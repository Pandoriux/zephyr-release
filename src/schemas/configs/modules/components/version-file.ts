import * as v from "@valibot/valibot";
import {
  VersionFileExtractors,
  VersionFileParsers,
} from "../../../../constants/version-file-options.ts";

export const VersionFileSchema = v.object({
  path: v.pipe(
    v.string(),
    v.nonEmpty(),
    v.metadata({
      description: "Path to the version file, relative to the project root.",
    }),
  ),
  parser: v.pipe(
    v.optional(v.enum(VersionFileParsers), "auto"),
    v.metadata({
      description: "Defines which parser should be used to parse the file."
        + "\nDefault: `auto`",
    }),
  ),
  extractor: v.pipe(
    v.optional(v.enum(VersionFileExtractors), "auto"),
    v.metadata({
      description: "Defines how to extract the version from the parsed file."
        + "\nDefault: `auto`",
    }),
  ),
  selector: v.pipe(
    v.string(),
    v.nonEmpty(),
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
type _VersionFileOutput = v.InferOutput<typeof VersionFileSchema>;
