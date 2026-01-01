import * as v from "@valibot/valibot";
import { AdditionalLabelOnCloseRemoveOptions } from "../../../../constants/additional-label.ts";

export const AdditionalLabelSchema = v.object({
  onCreateAdd: v.pipe(
    v.optional(
      v.union([
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        v.array(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      ]),
    ),
    v.metadata({
      description: "Additional labels to add when pull request is created.",
    }),
  ),
  onCloseAdd: v.pipe(
    v.optional(
      v.union([
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        v.array(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      ]),
    ),
    v.metadata({
      description:
        "Additional labels to add when pull request is closed and release operation has completed.",
    }),
  ),
  onCloseRemove: v.pipe(
    v.optional(
      v.union([
        v.pipe(v.string(), v.trim(), v.nonEmpty()),
        v.array(v.pipe(v.string(), v.trim(), v.nonEmpty())),
      ]),
    ),
    v.metadata({
      description:
        "Additional labels to remove when pull request is closed and release operation has completed. Use " +
        `"${AdditionalLabelOnCloseRemoveOptions.allOnCreate}"` +
        " to remove all labels added in `onCreateAdd`.",
    }),
  ),
});

type _AdditionalLabelInput = v.InferInput<typeof AdditionalLabelSchema>;
type _AdditionalLabelOutput = v.InferOutput<typeof AdditionalLabelSchema>;
