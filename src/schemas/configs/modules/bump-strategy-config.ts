import * as v from "@valibot/valibot";
import { BumpRuleSchema } from "./components/bump-rule.ts";
import {
  DEFAULT_BUILD_BUMP_STRATEGY,
  DEFAULT_MAJOR_BUMP_STRATEGY,
  DEFAULT_MINOR_BUMP_STRATEGY,
  DEFAULT_PATCH_BUMP_STRATEGY,
  DEFAULT_PRERELEASE_BUMP_STRATEGY,
} from "../../../constants/defaults/bump-strategy.ts";

export const BumpStrategyConfigSchema = v.pipe(
  v.object({
    major: v.pipe(
      v.optional(BumpRuleSchema, DEFAULT_MAJOR_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping major version (x.0.0).",
      }),
    ),
    minor: v.pipe(
      v.optional(BumpRuleSchema, DEFAULT_MINOR_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping minor version (0.x.0).\n" +
          "Default: `[feat]`.",
      }),
    ),
    patch: v.pipe(
      v.optional(BumpRuleSchema, DEFAULT_PATCH_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping patch version (0.0.x).\n" +
          "Default: `[fix, perf]`.",
      }),
    ),
    prerelease: v.pipe(
      v.optional(BumpRuleSchema, DEFAULT_PRERELEASE_BUMP_STRATEGY),
      v.metadata({
        description:
          "Strategy for bumping prerelease version (x.x.x-alpha.x).\n" +
          "Default: `[]`.",
      }),
    ),
    build: v.pipe(
      v.optional(BumpRuleSchema, DEFAULT_BUILD_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping build metadata (x.x.x+meta).\n" +
          "Default: `[]`.",
      }),
    ),

    bumpMinorForMajorPreStable: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Redirects major version bumps to minor in pre-1.0 (0.x.x).\n" +
          "Default: `true`.",
      }),
    ),
    bumpPatchForMinorPreStable: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description:
          "Redirects minor version bumps to patch in pre-1.0 (0.x.x).\n" +
          "Default: `false`.",
      }),
    ),
  }),
  v.metadata({
    description: "Configuration options to calculate the next version number.",
  }),
);

type _BumpStrategyConfigInput = v.InferInput<typeof BumpStrategyConfigSchema>;
type _BumpStrategyConfigOutput = v.InferOutput<typeof BumpStrategyConfigSchema>;
