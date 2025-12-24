import * as v from "@valibot/valibot";
import { CommandSchema } from "./command.ts";

export const CommandHookSchema = v.object({
  pre: v.pipe(
    v.optional(
      v.array(
        v.union([CommandSchema, v.pipe(v.string(), v.trim(), v.nonEmpty())]),
      ),
    ),
    v.metadata({
      description: "Commands to run before the operation.",
    }),
  ),
  post: v.pipe(
    v.optional(
      v.array(
        v.union([CommandSchema, v.pipe(v.string(), v.trim(), v.nonEmpty())]),
      ),
    ),
    v.metadata({
      description: "Commands to run after the operation.",
    }),
  ),
});

type _CommandHookInput = v.InferInput<typeof CommandHookSchema>;
type _CommandHookOutput = v.InferOutput<typeof CommandHookSchema>;
