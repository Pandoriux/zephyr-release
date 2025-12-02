import * as v from "@valibot/valibot";

export const BumpRuleSchema = v.object({
  types: v.pipe(
    v.optional(v.array(v.string()), []),
    v.metadata({
      description: "Commit types that count toward version bumping.",
    }),
  ),
  countBreakingAsCommit: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description:
        "Count a breaking change as one commit regardless of current chosen `types`, provided that the commit type exists in base commit types list.\n" +
        "Default: `false`",
    }),
  ),
  countBreakingAsBump: v.pipe(
    v.optional(v.boolean(), false),
    v.metadata({
      description:
        "Count a breaking change as one bump directly regardless of current chosen `types`, provided that the commit type exists in base commit types list.\n" +
        "Default: `false`",
    }),
  ),
  commitsPerBump: v.pipe(
    v.optional(
      v.pipe(
        v.union([
          v.pipe(v.number(), v.minValue(0), v.integer()),
          v.literal(Infinity),
          v.literal("Infinity"),
        ]),
        v.transform((value) => typeof value === "string" ? Infinity : value),
      ),
      1,
    ),
    v.metadata({
      description:
        "Number of commits required for additional version bump after the first. Use Infinity to always bump once, even if breaking changes are counted as bumps.\n" +
        "Default: `1`.",
    }),
  ),
});

type _BumpRuleInput = v.InferInput<typeof BumpRuleSchema>;
type _BumpRuleOutput = v.InferOutput<typeof BumpRuleSchema>;
