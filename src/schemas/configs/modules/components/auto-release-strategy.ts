import * as v from "@valibot/valibot";
import type { AutoStrategyType } from "../../../../constants/auto-release-strategy-types.ts";
import { trimNonEmptyStringSchema } from "../../../string.ts";

function AutoStrategyTypeSchema<T extends AutoStrategyType>(
  type: T,
  description: string,
) {
  return v.pipe(
    v.literal(type),
    v.metadata({
      description,
    }),
  );
}

export const AutoStrategySchema = v.variant("type", [
  v.object({
    type: AutoStrategyTypeSchema(
      "commit-types",
      "Triggers a release automatically when the pushed commits contain specific allowed types.",
    ),
    allowedTypes: v.pipe(
      v.optional(
        v.union([
          trimNonEmptyStringSchema,
          v.pipe(v.array(trimNonEmptyStringSchema), v.nonEmpty()),
        ]),
      ),
      v.transform((input) => {
        if (input !== undefined) return Array.isArray(input) ? input : [input];
        return input;
      }),
      v.metadata({
        description:
          "Allowed commit types that can trigger a release, must be chosen from the base `commitTypes`. If omitted, " +
          "all types in the base `commitTypes` are allowed.",
      }),
    ),
  }),

  v.object({
    type: AutoStrategyTypeSchema(
      "commit-footer",
      "Triggers a release automatically when a specific token is found in the commit footers.",
    ),
    token: v.pipe(
      trimNonEmptyStringSchema,
      v.metadata({
        description:
          'The conventional commit footer token to look for (e.g., "Autorelease").',
      }),
    ),
    value: v.pipe(
      v.optional(trimNonEmptyStringSchema),
      v.metadata({
        description:
          'The specific value the footer token must have (e.g., "true"). If omitted, the strategy triggers as long as ' +
          "the token exists.",
      }),
    ),
  }),

  v.object({
    type: AutoStrategyTypeSchema(
      "flag",
      "Triggers a release based on a strict boolean flag. Ideal for dynamic configuration overrides and custom script evaluations.",
    ),
    value: v.pipe(
      v.optional(v.boolean(), false),
      v.metadata({
        description:
          "A hardcoded boolean flag to explicitly force or skip the release trigger.",
      }),
    ),
  }),
]);

export type AutoStrategyInput = v.InferInput<typeof AutoStrategySchema>;
type _AutoStrategyOutput = v.InferOutput<typeof AutoStrategySchema>;
