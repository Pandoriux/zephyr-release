import * as v from "@valibot/valibot";
import { BumpStrategyObjectSchema } from "./parts/bump-strategy-object.ts";
import {
  DEFAULT_BUILD_BUMP_STRATEGY,
  DEFAULT_MAJOR_BUMP_STRATEGY,
  DEFAULT_MINOR_BUMP_STRATEGY,
  DEFAULT_PATCH_BUMP_STRATEGY,
  DEFAULT_PRERELEASE_BUMP_STRATEGY,
} from "../../../constants/defaults/bump-strategy.ts";

export const BumpStrategySchema = v.pipe(
  v.object({
    major: v.pipe(
      v.optional(BumpStrategyObjectSchema, DEFAULT_MAJOR_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping major version (x.0.0).",
      }),
    ),
    minor: v.pipe(
      v.optional(BumpStrategyObjectSchema, DEFAULT_MINOR_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping minor version (0.x.0)."
          + "\nDefault: `[feat]`.",
      }),
    ),
    patch: v.pipe(
      v.optional(BumpStrategyObjectSchema, DEFAULT_PATCH_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping patch version (0.0.x)."
          + "\nDefault: `[fix, perf]`.",
      }),
    ),
    prerelease: v.pipe(
      v.optional(BumpStrategyObjectSchema, DEFAULT_PRERELEASE_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping prerelease version (x.x.x-alpha.x)."
          + "\nDefault: `[]`.",
      }),
    ),
    build: v.pipe(
      v.optional(BumpStrategyObjectSchema, DEFAULT_BUILD_BUMP_STRATEGY),
      v.metadata({
        description: "Strategy for bumping build metadata (x.x.x+meta)."
          + "\nDefault: `[]`.",
      }),
    ),

    bumpMinorForMajorPreStable: v.pipe(
      v.optional(v.boolean(), true),
      v.metadata({
        description:
          "Redirects major version bumps to minor in pre-1.0 (0.x.x)."
          + "\nDefault: `true`.",
      }),
    ),
    bumpPatchForMinorPreStable: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description:
          "Redirects minor version bumps to patch in pre-1.0 (0.x.x)."
          + "\nDefault: `false`.",
      }),
    ),
  }),
  v.metadata({
    description: "Configuration options to calculate the next version number.",
  }),
);

type _BumpStrategyInput = v.InferInput<typeof BumpStrategySchema>;
type _BumpStrategyOutput = v.InferOutput<typeof BumpStrategySchema>;
