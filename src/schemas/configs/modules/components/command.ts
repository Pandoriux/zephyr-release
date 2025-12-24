import * as v from "@valibot/valibot";

export const CommandSchema = v.object({
  cmd: v.pipe(v.string(), v.trim()),
  timeout: v.pipe(
    v.optional(v.pipe(v.number(), v.minValue(1), v.safeInteger()), 60 * 1000),
    v.metadata({
      description: "Timeout in milliseconds.\n" + "Default: 60000 (1 min)",
    }),
  ),
});

type _CommandInput = v.InferInput<typeof CommandSchema>;
type _CommandOutput = v.InferOutput<typeof CommandSchema>;
