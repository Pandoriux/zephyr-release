import * as v from "@valibot/valibot";
import { SemverExtensionsSchema } from "./semver-extensions.ts";

export const BumpRuleBuildSchema = v.object({
  enabled: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description: "Enable/disable handling of build metadata.\n" +
        "Default: false",
    }),
  ),
  override: v.pipe(
    v.optional(v.pipe(v.array(v.pipe(v.string(), v.trim(), v.nonEmpty())), v.nonEmpty())),
    v.metadata({
      description:
        "Overrides build metadata to use for the next version. When provided, these values take precedence over " +
        "all other bump rules. Should only be set dynamically, not in static config.",
    }),
  ),

  metadata: v.pipe(
    v.optional(v.pipe(v.array(SemverExtensionsSchema), v.nonEmpty())),
    v.metadata({
      description:
        "Specifies the build metadata to use when bumping a pre-release version. " +
        "If not provided, keep the current existing build metadata.",
    }),
  ),
});

type _BumpRuleBuildInput = v.InferInput<typeof BumpRuleBuildSchema>;
type _BumpRuleBuildOutput = v.InferOutput<typeof BumpRuleBuildSchema>;
