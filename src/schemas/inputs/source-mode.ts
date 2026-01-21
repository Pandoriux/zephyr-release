import * as v from "@valibot/valibot";
import { SourceModeOptions } from "../../constants/source-mode-options.ts";

export const SourceModeSchema = v.object({
  sourceMode: v.optional(v.enum(SourceModeOptions), "remote"),

  versionFiles: v.optional(
    v.union([
      v.enum(SourceModeOptions),
      v.record(
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        v.enum(SourceModeOptions),
      ),
    ]),
  ),

  contentBodyOverridePath: v.optional(v.enum(SourceModeOptions)),
});

type _SourceModeInput = v.InferInput<typeof SourceModeSchema>;
type _SourceModeOutput = v.InferOutput<typeof SourceModeSchema>;
