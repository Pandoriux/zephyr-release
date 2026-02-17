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

  changelogPath: v.optional(v.enum(SourceModeOptions)),
  changelogReleaseBodyOverridePath: v.optional(v.enum(SourceModeOptions)),
  changelogFileHeaderTemplatePath: v.optional(v.enum(SourceModeOptions)),
  changelogFileFooterTemplatePath: v.optional(v.enum(SourceModeOptions)),
  changelogReleaseHeaderTemplatePath: v.optional(v.enum(SourceModeOptions)),
  changelogReleaseSectionEntryTemplatePath: v.optional(v.enum(SourceModeOptions)),
  changelogReleaseBreakingSectionEntryTemplatePath: v.optional(v.enum(SourceModeOptions)),
  changelogReleaseFooterTemplatePath: v.optional(v.enum(SourceModeOptions)),


  prTitleTemplatePath: v.optional(v.enum(SourceModeOptions)),
  prHeaderTemplatePath: v.optional(v.enum(SourceModeOptions)),
  prBodyTemplatePath: v.optional(v.enum(SourceModeOptions)),
  prFooterTemplatePath: v.optional(v.enum(SourceModeOptions)),

  releaseTagMessageTemplatePath: v.optional(v.enum(SourceModeOptions)),
  releaseTitleTemplatePath: v.optional(v.enum(SourceModeOptions)),
  releaseBodyTemplatePath: v.optional(v.enum(SourceModeOptions)),
});

type _SourceModeInput = v.InferInput<typeof SourceModeSchema>;
export type SourceModeOutput = v.InferOutput<typeof SourceModeSchema>;
