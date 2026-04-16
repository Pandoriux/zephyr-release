import type { BumpRuleInput } from "../../schemas/configs/modules/components/bump-rule-core.ts";

export const DEFAULT_MAJOR_BUMP_STRATEGY = {
  countBreakingAs: "commit",
} satisfies BumpRuleInput;

export const DEFAULT_MINOR_BUMP_STRATEGY = {
  types: ["feat"],
} satisfies BumpRuleInput;

export const DEFAULT_PATCH_BUMP_STRATEGY = {
  types: ["fix", "perf"],
} satisfies BumpRuleInput;
