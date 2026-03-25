import { pooledMap } from "@std/async";
import { LabelOnCloseRemoveOptions } from "../constants/label-options.ts";
import type { ReviewConfigOutput } from "../schemas/configs/modules/review-config.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { taskLogger } from "./logger.ts";
import { consumeAsyncIterable } from "../utils/async.ts";

interface AddLabelsToProposalConfigParams {
  review: Pick<ReviewConfigOutput, "label" | "additionalLabel">;
}

/** @throws */
export async function addLabelsToProposal(
  provider: PlatformProvider,
  proposalId: string,
  config: AddLabelsToProposalConfigParams,
) {
  const { label, additionalLabel } = config.review;

  taskLogger.info("Adding core labels...");
  await provider.addLabelsToProposal(proposalId, {
    createIfMissing: true,
    labels: [label.onCreate],
  });

  if (additionalLabel?.onCreateAdd) {
    taskLogger.info("Adding additional labels...");

    await provider.addLabelsToProposal(proposalId, {
      createIfMissing: false,
      labels: additionalLabel.onCreateAdd,
    });
  }
}

type UpdateMergedProposalLabelsConfigParams = AddLabelsToProposalConfigParams;

/** @throws */
export async function updateMergedProposalLabels(
  provider: PlatformProvider,
  proposalId: string,
  config: UpdateMergedProposalLabelsConfigParams,
) {
  const { label, additionalLabel } = config.review;

  taskLogger.info("Updating core labels on merged proposal...");
  await provider.removeLabelFromProposal(
    proposalId,
    label.onCreate.name,
  );
  await provider.addLabelsToProposal(proposalId, {
    createIfMissing: true,
    labels: [label.onClose],
  });

  taskLogger.info("Updating other additional labels on merged proposal...");

  if (additionalLabel.onCloseRemove) {
    const labelsToRemove = new Set<string>();

    for (const label of additionalLabel.onCloseRemove) {
      if (
        label === LabelOnCloseRemoveOptions.allOnCreate &&
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
          await provider.removeLabelFromProposal(proposalId, label);
        } catch { /* ignore */ }
      }),
    );
  }

  if (additionalLabel.onCloseAdd) {
    taskLogger.info(
      `Adding labels to merged proposal (${additionalLabel.onCloseAdd.length} in total)...`,
    );
    await provider.addLabelsToProposal(proposalId, {
      createIfMissing: false,
      labels: additionalLabel.onCloseAdd,
    });
  }
}
