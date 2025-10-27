import * as v from "@valibot/valibot";
import { VersionFileResolvers } from "../../../../constants/version-file-type.ts";

export const VersionFileObjectSchema = v.object({
  path: v.pipe(
    v.string(),
    v.nonEmpty(),
    v.metadata({
      description: "Path to the version file, relative to the project root.",
    }),
  ),
  resolver: v.pipe(
    v.optional(v.enum(VersionFileResolvers), "auto"),
    v.metadata({
      description: "Defines how to resolve the version from this file."
        + "\nDefault: `auto`",
    }),
  ),
  selector: v.pipe(
    v.string(),
    v.nonEmpty(),
    v.metadata({
      description:
        "Json path to locates the version field. For regex resolver, supply a regex string.",
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

type _VersionFileObjectInput = v.InferInput<typeof VersionFileObjectSchema>;
type _VersionFileObjectOutput = v.InferOutput<typeof VersionFileObjectSchema>;
