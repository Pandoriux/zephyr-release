import type { BumpRuleInput } from "../../schemas/configs/modules/components/bump-rule.ts";

export const DEFAULT_MAJOR_BUMP_STRATEGY: BumpRuleInput = {
  countBreakingAs: "bump",
};

export const DEFAULT_MINOR_BUMP_STRATEGY: BumpRuleInput = {
  types: ["feat"],
};

export const DEFAULT_PATCH_BUMP_STRATEGY: BumpRuleInput = {
  types: ["fix", "perf"],
};
