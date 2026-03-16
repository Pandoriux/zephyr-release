import type { AutoStrategyInput } from "../../schemas/configs/modules/components/auto-release-strategy.ts";

export const DEFAULT_AUTO_RELEASE_STRATEGY: AutoStrategyInput = {
  type: "commit-types",
};
