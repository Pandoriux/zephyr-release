import type { BumpRuleInput } from "../../schemas/configs/modules/components/bump-rule.ts";

export const DEFAULT_MAJOR_BUMP_STRATEGY: BumpRuleInput = {
  types: [],
  countBreakingAs: "bump",
  commitsPerBump: 1,
};

export const DEFAULT_MINOR_BUMP_STRATEGY: BumpRuleInput = {
  types: ["feat"],
  commitsPerBump: 1,
};

export const DEFAULT_PATCH_BUMP_STRATEGY: BumpRuleInput = {
  types: ["fix", "perf"],
  commitsPerBump: 1,
};
