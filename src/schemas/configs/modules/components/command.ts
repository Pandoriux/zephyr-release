import * as v from "@valibot/valibot";

export const CommandSchema = v.union([
  v.pipe(v.string(), v.trim()),

  v.object({
    cmd: v.pipe(v.string(), v.trim()),
    timeout: v.pipe(
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
      ),
      v.metadata({
        description:
          "Timeout in milliseconds, use Infinity to never timeout (not recommended).\n" +
          "Defaults to `commandHook` base `timeout` value",
      }),
    ),
    continueOnError: v.pipe(
      v.optional(v.boolean()),
      v.metadata({
        description: "Continue or stop the process on commands error.\n" +
          "Defaults to `commandHook` base `continueOnError` value",
      }),
    ),
  }),
]);

type _CommandInput = v.InferInput<typeof CommandSchema>;
export type CommandOutput = v.InferOutput<typeof CommandSchema>;
