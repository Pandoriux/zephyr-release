import * as v from "@valibot/valibot";

export const BumpStrategySchema = v.pipe(
  v.object({}),
  v.metadata({
    description: "Configuration options to calculate the next version number.",
  }),
);

type _BumpStrategyInput = v.InferInput<typeof BumpStrategySchema>;
type _BumpStrategyOutput = v.InferOutput<typeof BumpStrategySchema>;
