import * as v from "@valibot/valibot";
import { BaseConfigSchema } from "./modules/base-config.ts";
import { BumpStrategyConfigSchema } from "./modules/bump-strategy-config.ts";
import { PullRequestConfigSchema } from "./modules/pull-request-config.ts";
import { ReleaseConfigSchema } from "./modules/release-config.ts";
import { ChangelogConfigSchema } from "./modules/changelog-config.ts";
import { toCamelCase } from "@std/text";

export const ConfigSchema = v.pipe(
  v.object({
    ...BaseConfigSchema.entries,

    bumpStrategy: v.optional(BumpStrategyConfigSchema, {}),

    changelog: v.optional(ChangelogConfigSchema, {}),

    pullRequest: v.optional(PullRequestConfigSchema, {}),

    release: v.optional(ReleaseConfigSchema, {}),
  }),
  v.metadata({
    title: "Zephyr Release configuration file",
    description:
      "A JSON representation of a Zephyr Release configuration file.",
  }),
);

type _ConfigInput = v.InferInput<typeof ConfigSchema>;
export type ConfigOutput = v.InferOutput<typeof ConfigSchema>;

export const ParseJsonConfigSchema = v.pipe(
  v.string(),
  v.parseJson({
    reviver: (_key, value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => [toCamelCase(k), v]),
        );
      }

      return value;
    },
  }),
  ConfigSchema,
);
