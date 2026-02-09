import type { PullRequestConfigOutput } from "../schemas/configs/modules/pull-request-config.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";

interface AddLabelsToPrConfigParams {
  pullRequest: Pick<PullRequestConfigOutput, "label" | "additionalLabel">;
}

export async function addLabelsToPullRequestOrThrow(
  provider: PlatformProvider,
  prNumber: number,
  config: AddLabelsToPrConfigParams,
) {
  const { label, additionalLabel } = config.pullRequest;

  await provider.addLabelsToPullRequestOrThrow(
    prNumber,
    [label.onCreate],
    additionalLabel.onCreateAdd,
  );
}
