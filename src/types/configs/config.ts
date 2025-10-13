import * as v from "@valibot/valibot";
import { PullRequestConfigSchema } from "./modules/pull-request-config.ts";
import { TagConfigSchema } from "./modules/tag-config.ts";
import { ReleaseConfigSchema } from "./modules/release-config.ts";
import { BaseConfigSchema } from "./modules/base-config.ts";

export const ConfigSchema = v.pipe(
  v.object({
    ...BaseConfigSchema.entries,

    pullRequest: v.optional(PullRequestConfigSchema, {}),

    tag: v.optional(TagConfigSchema, {}),

    release: v.optional(ReleaseConfigSchema, {}),
  }),
  v.metadata({
    title: "Zephyr Release configuration file schema",
    description:
      "A JSON representation of a Zephyr Release configuration file.",
  }),
);

type _ConfigInput = v.InferInput<typeof ConfigSchema>;
type _ConfigOutput = v.InferOutput<typeof ConfigSchema>;
