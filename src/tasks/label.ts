import { pooledMap } from "@std/async";
import { AdditionalLabelOnCloseRemoveOptions } from "../constants/additional-label-options.ts";
import type { ReviewConfigOutput } from "../schemas/configs/modules/review-config.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { taskLogger } from "./logger.ts";
import { consumeAsyncIterable } from "../utils/async.ts";

interface AddLabelsToProposalConfigParams {
  review: Pick<ReviewConfigOutput, "label" | "additionalLabel">;
}

export async function addLabelsToProposalOrThrow(
  provider: PlatformProvider,
  proposalId: string,
  config: AddLabelsToProposalConfigParams,
) {
  const { label, additionalLabel } = config.review;

  taskLogger.info("Adding core labels...");
  await provider.addLabelsToProposalOrThrow(proposalId, {
    createIfMissing: true,
    labels: [label.onCreate],
  });

  if (additionalLabel?.onCreateAdd) {
    taskLogger.info("Adding additional labels...");

    await provider.addLabelsToProposalOrThrow(proposalId, {
      createIfMissing: false,
      labels: additionalLabel.onCreateAdd,
    });
  }
}

type UpdateMergedProposalLabelsConfigParams = AddLabelsToProposalConfigParams;

export async function updateMergedProposalLabelsOrThrow(
  provider: PlatformProvider,
  proposalId: string,
  config: UpdateMergedProposalLabelsConfigParams,
) {
  const { label, additionalLabel } = config.review;

  taskLogger.info("Updating core labels on merged proposal...");
  await provider.removeLabelFromProposalOrThrow(
    proposalId,
    label.onCreate.name,
  );
  await provider.addLabelsToProposalOrThrow(proposalId, {
    createIfMissing: true,
    labels: [label.onClose],
  });

  taskLogger.info("Updating other additional labels on merged proposal...");

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
      `Removing labels from merged proposal (${labelsToRemove.size} in total)...`,
    );
    await consumeAsyncIterable(
      pooledMap(5, labelsToRemove, async (label) => {
        try {
          await provider.removeLabelFromProposalOrThrow(proposalId, label);
        } catch { /* ignore */ }
      }),
    );
  }

  if (additionalLabel.onCloseAdd) {
    taskLogger.info(
      `Adding labels to merged proposal (${additionalLabel.onCloseAdd.length} in total)...`,
    );
    await provider.addLabelsToProposalOrThrow(proposalId, {
      createIfMissing: false,
      labels: additionalLabel.onCloseAdd,
    });
  }
}
