import * as v from "@valibot/valibot";
import { BaseConfigSchema } from "./modules/base-config.ts";
import { BumpStrategySchema } from "./modules/bump-strategy-config.ts";
import { PullRequestConfigSchema } from "./modules/pull-request-config.ts";
import { TagConfigSchema } from "./modules/tag-config.ts";
import { ReleaseConfigSchema } from "./modules/release-config.ts";

export const ConfigSchema = v.pipe(
  v.object({
    ...BaseConfigSchema.entries,

    bumpStrategy: v.optional(BumpStrategySchema, {}),

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
