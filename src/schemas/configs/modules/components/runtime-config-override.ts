import * as v from "@valibot/valibot";
import { trimNonEmptyStringSchema } from "../../../string.ts";
import { ConfigFileFormatsWithAuto } from "../../../../constants/file-formats.ts";

export const RuntimeConfigOverrideSchema = v.object({
  path: trimNonEmptyStringSchema,
  format: v.optional(v.enum(ConfigFileFormatsWithAuto), "auto"),
});

type _RuntimeConfigOverrideInput = v.InferInput<
  typeof RuntimeConfigOverrideSchema
>;
export type RuntimeConfigOverrideOutput = v.InferOutput<
  typeof RuntimeConfigOverrideSchema
>;
