import * as v from "@valibot/valibot";
import { SourceModeOptions } from "../../constants/source-mode-options.ts";
import { trimNonEmptyStringSchema } from "../string.ts";

export const SourceModeSchema = v.object({
  sourceMode: v.optional(v.enum(SourceModeOptions), "remote"),

  versionFiles: v.optional(
    v.union([
      v.enum(SourceModeOptions),
      v.record(trimNonEmptyStringSchema, v.enum(SourceModeOptions)),
    ]),
  ),

  releaseBodyOverridePath: v.optional(v.enum(SourceModeOptions)),
});

type _SourceModeInput = v.InferInput<typeof SourceModeSchema>;
type _SourceModeOutput = v.InferOutput<typeof SourceModeSchema>;
