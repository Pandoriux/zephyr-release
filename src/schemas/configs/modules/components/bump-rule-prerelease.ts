import * as v from "@valibot/valibot";
import { SemverExtensionsSchema } from "./semver-extensions.ts";

export const BumpRulePrereleaseSchema = v.object({
  enabled: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description: "Enable/disable handling of pre-release identifiers.\n" +
        "Default: false",
    }),
  ),
  override: v.pipe(
    v.optional(v.array(v.union([v.pipe(v.string(), v.trim()), v.number()]))),
    v.metadata({
      description:
        "Overrides pre-release identifiers to use for the next version. When provided, these values take precedence over " +
        "all other bump rules. Should only be set dynamically, not in static config.",
    }),
  ),

  identifiers: v.pipe(
    v.optional(v.array(SemverExtensionsSchema)),
    v.metadata({
      description:
        "Specifies the pre-release identifiers to use when bumping a pre-release version. " +
        "If not provided, keep the current existing pre-release identifiers.",
    }),
  ),
});

type _BumpRulePrereleaseInput = v.InferInput<typeof BumpRulePrereleaseSchema>;
type _BumpRulePrereleaseOutput = v.InferOutput<typeof BumpRulePrereleaseSchema>;
