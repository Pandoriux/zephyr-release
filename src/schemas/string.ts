import * as v from "@valibot/valibot";

export const trimNonEmptyStringSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty(),
);
