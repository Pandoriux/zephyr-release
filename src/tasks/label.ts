import { pooledMap } from "@std/async";
import { AdditionalLabelOnCloseRemoveOptions } from "../constants/additional-label-options.ts";
import type { PullRequestConfigOutput } from "../schemas/configs/modules/pull-request-config.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { taskLogger } from "./logger.ts";
import { consumeAsyncIterable } from "../utils/async.ts";

interface AddLabelsToPrConfigParams {
  pullRequest: Pick<PullRequestConfigOutput, "label" | "additionalLabel">;
}

export async function addLabelsToPullRequestOrThrow(
  provider: PlatformProvider,
  prNumber: number,
  config: AddLabelsToPrConfigParams,
) {
  const { label, additionalLabel } = config.pullRequest;

  taskLogger.info("Adding core labels...");
  await provider.addLabelsToPullRequestOrThrow(prNumber, {
    createIfMissing: true,
    labels: [label.onCreate],
  });

  if (additionalLabel?.onCreateAdd) {
    taskLogger.info("Adding additional labels...");

    await provider.addLabelsToPullRequestOrThrow(prNumber, {
      createIfMissing: false,
      labels: additionalLabel.onCreateAdd,
    });
  }
}

type UpdateMergedPrLabelsConfigParams = AddLabelsToPrConfigParams;

export async function updateMergedPullRequestLabelsOrThrow(
  provider: PlatformProvider,
  prNumber: number,
  config: UpdateMergedPrLabelsConfigParams,
) {
  const { label, additionalLabel } = config.pullRequest;

  taskLogger.info("Updating core labels on merged pull request...");
  await provider.removeLabelFromPullRequestOrThrow(
    prNumber,
    label.onCreate.name,
  );
  await provider.addLabelsToPullRequestOrThrow(prNumber, {
    createIfMissing: true,
    labels: [label.onClose],
  });

  taskLogger.info("Updating other labels on merged pull request...");

  if (additionalLabel.onCloseRemove) {
    const labelsToRemove = new Set<string>();

    for (const label of additionalLabel.onCloseRemove) {
      if (
        label === AdditionalLabelOnCloseRemoveOptions.allOnCreateAdd &&
        additionalLabel.onCreateAdd
      ) {
        additionalLabel.onCreateAdd.forEach((l) => labelsToRemove.add(l));

        continue;
      }

      labelsToRemove.add(label);
    }

    taskLogger.info(
      `Removing labels from merged pull request (${labelsToRemove.size} in total)...`,
    );
    await consumeAsyncIterable(
      pooledMap(5, labelsToRemove, async (label) => {
        try {
          await provider.removeLabelFromPullRequestOrThrow(prNumber, label);
        } catch { /* ignore */ }
      }),
    );
  }

  if (additionalLabel.onCloseAdd) {
    taskLogger.info(
      `Adding labels to merged pull request (${additionalLabel.onCloseAdd.length} in total)...`,
    );
    await provider.addLabelsToPullRequestOrThrow(prNumber, {
      createIfMissing: false,
      labels: additionalLabel.onCloseAdd,
    });
  }
}
