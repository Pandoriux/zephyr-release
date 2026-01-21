import type { ResolvedCommit } from "../../experiments/conventional-commit-changelog/test-parse-and-changelog.ts";
import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { ChangelogConfigOutput } from "../schemas/configs/modules/changelog-config.ts";

type GenerateChangelogBodyConfigParams = Pick<ConfigOutput, "commitTypes"> & {
  changelog: Pick<ChangelogConfigOutput, "contentBodyOverride">;
};

export function generateChangelogContentBody(
  resolvedCommits: ResolvedCommit[],
  token: string,
  config: GenerateChangelogBodyConfigParams,
) {
  const { commitTypes, changelog: { contentBodyOverride } } = config;
}
