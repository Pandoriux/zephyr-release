import * as v from "@valibot/valibot";
import { BumpRuleSchema } from "./components/bump-rule.ts";
import {
  DEFAULT_MAJOR_BUMP_STRATEGY,
  DEFAULT_MINOR_BUMP_STRATEGY,
  DEFAULT_PATCH_BUMP_STRATEGY,
} from "../../../constants/defaults/bump-strategy.ts";
import { transformObjKeyToKebabCase } from "../../../utils/transformers/object.ts";
import { BumpRulePrereleaseSchema } from "./components/bump-rule-prerelease.ts";
import { BumpRuleBuildSchema } from "./components/bump-rule-build.ts";

export const BumpStrategyConfigSchema = v.pipe(
  v.object({
    major: v.pipe(
      v.optional(BumpRuleSchema, DEFAULT_MAJOR_BUMP_STRATEGY),
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
      v.optional(BumpRuleSchema, DEFAULT_MINOR_BUMP_STRATEGY),
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
      v.optional(BumpRuleSchema, DEFAULT_PATCH_BUMP_STRATEGY),
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
      v.optional(BumpRulePrereleaseSchema, {}),
      v.metadata({
        description: "Strategy for bumping prerelease version (1.2.3-x.x).",
      }),
    ),
    build: v.pipe(
      v.optional(BumpRuleBuildSchema, {}),
      v.metadata({
        description: "Strategy for bumping build metadata (1.2.3+x.x).",
      }),
    ),

    bumpMinorForMajorPreStable: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Redirects major version bumps to minor in pre-1.0 (0.x.3).\n" +
          "Default: true",
      }),
    ),
    bumpPatchForMinorPreStable: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description:
          "Redirects minor version bumps to patch in pre-1.0 (0.2.x).\n" +
          "Default: false",
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
