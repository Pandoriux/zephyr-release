import * as v from "@valibot/valibot";
import { SemverExtensionSchema } from "./semver-extension.ts";
import { trimNonEmptyStringSchema } from "../../../string.ts";

export const BumpRuleExtensionSchema = v.object({
  enabled: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description:
        "Enable/disable handling of SemVer extensions (pre-release identifiers / build metadata).\n" +
        "Default: false",
    }),
  ),

  override: v.pipe(
    v.optional(
      v.pipe(
        v.array(
          v.union([trimNonEmptyStringSchema, v.number()]),
        ),
        v.nonEmpty(),
      ),
    ),
    v.transform((input) =>
      typeof input === "undefined" ? input : input.map(String)
    ),
    v.metadata({
      description:
        "Overrides extension items to use for the next version. When provided, these values take precedence over " +
        "all other bump rules in `extensions`. Should only be set dynamically, not in static config.",
    }),
  ),
  treatOverrideAsSignificant: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description:
        "If set to `true`, the presence of an `override` is strictly treated as a structural change.\n" +
        "This immediately triggers resets on any dependent version components (e.g., resetting the Build number)\n" +
        "If `false`, overrides are treated as volatile/dynamic and ignored by reset logic.\n" +
        "Default: false",
    }),
  ),

  extensions: v.pipe(
    v.optional(v.pipe(v.array(SemverExtensionSchema), v.nonEmpty())),
    v.metadata({
      description: "Specifies the items to use for SemVer extensions.",
    }),
  ),
});

type _BumpRuleExtensionInput = v.InferInput<typeof BumpRuleExtensionSchema>;
export type BumpRuleExtensionOutput = v.InferOutput<
  typeof BumpRuleExtensionSchema
>;
