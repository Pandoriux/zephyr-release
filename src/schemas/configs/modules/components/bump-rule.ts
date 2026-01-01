import * as v from "@valibot/valibot";
import { countBreakingAsOptions } from "../../../../constants/bump-rules.ts";

export const BumpRuleSchema = v.object({
  types: v.pipe(
    v.optional(v.array(v.pipe(v.string(), v.trim(), v.nonEmpty()))),
    v.metadata({
      description:
        "Commit types that count toward version bumping, must be picked from the base `commitTypes` list.",
    }),
  ),
  countBreakingAs: v.pipe(
    v.optional(v.enum(countBreakingAsOptions), "none"),
    v.metadata({
      description:
        "Count a breaking change as none / one commit / one bump directly regardless of current chosen `types`, as long as " +
        "the commit type exists in base `commitTypes` list.\n" +
        'Default: "none"',
    }),
  ),
  commitsPerBump: v.pipe(
    v.optional(
      v.pipe(
        v.union([
          v.pipe(v.number(), v.minValue(1), v.safeInteger()),
          v.literal(Infinity),
          v.literal("Infinity"),
          v.literal("infinity"),
        ]),
        v.transform((value) => typeof value === "string" ? Infinity : value),
      ),
      Infinity,
    ),
    v.metadata({
      description:
        "Number of commits required for additional version bump after the first. Use Infinity to always bump once, even " +
        "if breaking changes are counted as bumps.\n" +
        "Default: Infinity",
    }),
  ),
});

export type BumpRuleInput = v.InferInput<typeof BumpRuleSchema>;
type _BumpRuleOutput = v.InferOutput<typeof BumpRuleSchema>;
