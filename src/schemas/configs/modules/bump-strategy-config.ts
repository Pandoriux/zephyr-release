import * as v from "@valibot/valibot";
import { BumpRuleCoreSchema } from "./components/bump-rule-core.ts";
import { BumpRuleExtensionSchema } from "./components/bump-rule-extension.ts";
import {
  DEFAULT_MAJOR_BUMP_STRATEGY,
  DEFAULT_MINOR_BUMP_STRATEGY,
  DEFAULT_PATCH_BUMP_STRATEGY,
} from "../../../constants/defaults/bump-strategy.ts";
import { transformObjKeyToKebabCase } from "../../../utils/transformers/object.ts";

export const BumpStrategyConfigSchema = v.pipe(
  v.object({
    treatMajorAsMinorPreStable: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Treats major changes as minor version bumps in pre-1.0 (0.x.x) releases.\n" +
          "Default: true",
      }),
    ),
    treatMinorAsPatchPreStable: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Treats minor changes as patch version bumps in pre-1.0 (0.x.x) releases.\n" +
          "Default: true",
      }),
    ),

    major: v.pipe(
      v.optional(BumpRuleCoreSchema, DEFAULT_MAJOR_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping major version (x.2.3).\n" +
          `Default: ${
            JSON.stringify(
              transformObjKeyToKebabCase(DEFAULT_MAJOR_BUMP_STRATEGY),
              null,
              2,
            )
          }`,
      }),
    ),
    minor: v.pipe(
      v.optional(BumpRuleCoreSchema, DEFAULT_MINOR_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping minor version (1.x.3).\n" +
          `Default: ${
            JSON.stringify(
              transformObjKeyToKebabCase(DEFAULT_MINOR_BUMP_STRATEGY),
              null,
              2,
            )
          }`,
      }),
    ),
    patch: v.pipe(
      v.optional(BumpRuleCoreSchema, DEFAULT_PATCH_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping patch version (1.2.x).\n" +
          `Default: ${
            JSON.stringify(
              transformObjKeyToKebabCase(DEFAULT_PATCH_BUMP_STRATEGY),
              null,
              2,
            )
          }`,
      }),
    ),

    prerelease: v.pipe(
      v.optional(BumpRuleExtensionSchema, {}),
      v.metadata({
        description: "Strategy for bumping prerelease version (1.2.3-x.x).",
      }),
    ),
    build: v.pipe(
      v.optional(BumpRuleExtensionSchema, {}),
      v.metadata({
        description: "Strategy for bumping build metadata (1.2.3+x.x).",
      }),
    ),
  }),
  v.metadata({
    description: "Configuration options to calculate the next version number.",
  }),
);

type _BumpStrategyConfigInput = v.InferInput<typeof BumpStrategyConfigSchema>;
export type BumpStrategyConfigOutput = v.InferOutput<
  typeof BumpStrategyConfigSchema
>;
