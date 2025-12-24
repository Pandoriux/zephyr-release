import * as v from "@valibot/valibot";

export const CommandsSchema = v.object({
  pre: v.pipe(
    v.optional(v.array(v.string()), []),
    v.metadata({
      description: "Commands to run before the operation.\n" + "Default: []",
    }),
  ),
  post: v.pipe(
    v.optional(v.array(v.string()), []),
    v.metadata({
      description: "Commands to run after the operation.\n" + "Default: []",
    }),
  ),
});

type _CommandsInput = v.InferInput<typeof CommandsSchema>;
type _CommandsOutput = v.InferOutput<typeof CommandsSchema>;
