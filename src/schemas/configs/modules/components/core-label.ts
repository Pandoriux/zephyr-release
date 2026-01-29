import * as v from "@valibot/valibot";
import { LabelSchema } from "./label.ts";
import {
  DEFAULT_LABEL_ON_CLOSE,
  DEFAULT_LABEL_ON_CREATE,
} from "../../../../constants/defaults/label.ts";
import { transformObjKeyToKebabCase } from "../../../../utils/transformers/object.ts";
import { trimNonEmptyStringSchema } from "../../../string.ts";

const defaultLabelSchemaObject = v.getDefaults(LabelSchema);

export const CoreLabelSchema = v.object({
  onCreate: v.pipe(
    v.optional(
      v.union([trimNonEmptyStringSchema, LabelSchema]),
      DEFAULT_LABEL_ON_CREATE,
    ),
    v.transform((input) =>
      typeof input === "string"
        ? { ...defaultLabelSchemaObject, name: input }
        : input
    ),
    v.metadata({
      description: "Label to add when pull request is created.\n" +
        `Default: ${
          JSON.stringify(
            transformObjKeyToKebabCase(DEFAULT_LABEL_ON_CREATE),
            null,
            2,
          )
        }`,
    }),
  ),

  onClose: v.pipe(
    v.optional(
      v.union([trimNonEmptyStringSchema, LabelSchema]),
      DEFAULT_LABEL_ON_CLOSE,
    ),
    v.transform((input) =>
      typeof input === "string"
        ? { ...defaultLabelSchemaObject, name: input }
        : input
    ),
    v.metadata({
      description:
        "Label to add when pull request is closed and release operation has completed (replaces `onCreate` label).\n" +
        `Default: ${
          JSON.stringify(
            transformObjKeyToKebabCase(DEFAULT_LABEL_ON_CLOSE),
            null,
            2,
          )
        }`,
    }),
  ),
});

type _CoreLabelInput = v.InferInput<typeof CoreLabelSchema>;
export type CoreLabelOutput = v.InferOutput<typeof CoreLabelSchema>;
