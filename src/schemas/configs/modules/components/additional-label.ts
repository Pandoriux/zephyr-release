import * as v from "@valibot/valibot";
import { AdditionalLabelOnCloseRemoveOptions } from "../../../../constants/additional-label.ts";
import { trimNonEmptyStringSchema } from "../../../string.ts";

export const AdditionalLabelSchema = v.object({
  onCreateAdd: v.pipe(
    v.optional(
      v.union([
        trimNonEmptyStringSchema,
        v.pipe(v.array(trimNonEmptyStringSchema), v.nonEmpty()),
      ]),
    ),
    v.transform((input) => {
      if (input) return Array.isArray(input) ? input : [input];
      return input;
    }),
    v.metadata({
      description: "Additional labels to add when pull request is created.",
    }),
  ),
  onCloseAdd: v.pipe(
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
      if (input) return Array.isArray(input) ? input : [input];
      return input;
    }),
    v.metadata({
      description:
        "Additional labels to add when pull request is closed and release operation has completed.",
    }),
  ),
  onCloseRemove: v.pipe(
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
      if (input) return Array.isArray(input) ? input : [input];
      return input;
    }),
    v.metadata({
      description:
        "Additional labels to remove when pull request is closed and release operation has completed. Use " +
        `"${AdditionalLabelOnCloseRemoveOptions.allOnCreate}" ` +
        "to remove all labels added in `onCreateAdd`.",
    }),
  ),
});

type _AdditionalLabelInput = v.InferInput<typeof AdditionalLabelSchema>;
type _AdditionalLabelOutput = v.InferOutput<typeof AdditionalLabelSchema>;
