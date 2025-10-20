import * as v from "@valibot/valibot";

export const BumpStrategyObjectSchema = v.object({
  types: v.pipe(
    v.optional(v.array(v.string()), []),
    v.metadata({
      description: "Commit types that count toward version bumping.",
    }),
  ),
  commitsPerBump: v.pipe(
    v.optional(
      v.union([
        v.pipe(v.number(), v.minValue(0), v.integer()),
        v.literal(Infinity),
        v.literal("Infinity"),
      ]),
      1,
    ),
    v.transform((value) => typeof value === "string" ? Infinity : value),
    v.metadata({
      description:
        "Number of commits required for additional version bump after the first. Use Infinity to always bump once." + 
        "\nDefault: `1`.",
    }),
  ),
});

type _BumpStrategyObjectInput = v.InferInput<typeof BumpStrategyObjectSchema>;
type _BumpStrategyObjectOutput = v.InferOutput<typeof BumpStrategyObjectSchema>;
