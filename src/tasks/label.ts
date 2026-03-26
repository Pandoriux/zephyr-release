import { LabelOnMergeRemoveOptions } from "../constants/label-options.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { taskLogger } from "./logger.ts";
import type { LabelItemOutput } from "../schemas/configs/modules/components/label.ts";
import { failedNonCriticalTasks } from "../main.ts";

export async function addLabelsToProposalOnCreate(
  provider: PlatformProvider,
  proposalId: string,
  labelsToAdd: LabelItemOutput[],
) {
  try {
    taskLogger.info(
      `Adding ${labelsToAdd.length} labels to created proposal...`,
    );
    await provider.addLabelsToProposal(proposalId, labelsToAdd);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    taskLogger.warn(`Failed to add labels to proposal: ${message}`);
    failedNonCriticalTasks.push(message);
  }
}

/** @throws */
export async function updateProposalLabelsOnMerge(
  provider: PlatformProvider,
  proposalId: string,
  labelsToAdd?: LabelItemOutput[],
  labelsToRemove?: LabelItemOutput[],
) {
  if (labelsToAdd) {
    taskLogger.info(
      `Adding ${labelsToAdd.length} labels to merged proposal...`,
    );
    await provider.addLabelsToProposal(proposalId, labelsToAdd);
  }

  if (labelsToRemove) {
    const resolvedRemoveSet = new Set<string>();

    for (const label of labelsToRemove) {
      if (label.name === LabelOnMergeRemoveOptions.allOnCreate && labelsToAdd) {
        labelsToAdd.forEach((l) => resolvedRemoveSet.add(l.name));
      } else {
        resolvedRemoveSet.add(label.name);
      }
    }

    taskLogger.info(
      `Removing ${resolvedRemoveSet.size} labels from merged proposal...`,
    );
    await provider.removeLabelsFromProposal(proposalId, [...resolvedRemoveSet]);
  }
}
