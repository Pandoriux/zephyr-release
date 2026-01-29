import type { ResolvedCommit } from "./commit.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ChangelogConfigOutput } from "../schemas/configs/modules/changelog-config.ts";

type GenerateChangelogBodyConfigParams = Pick<ConfigOutput, "commitTypes"> & {
  changelog: Pick<ChangelogConfigOutput, "contentBodyOverride">;
};

export function generateChangelogContentBody(
  resolvedCommits: ResolvedCommit[],
  config: GenerateChangelogBodyConfigParams,
) {
  const { commitTypes, changelog: { contentBodyOverride } } = config;
}
