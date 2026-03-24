import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { logger } from "../tasks/logger.ts";
import type { OperationRunSettings } from "../types/operation-context.ts";
import { executeReviewPreparePhase } from "./review.prepare.ts";
import { executeReviewPublishPhase } from "./review.publish.ts";
import type { BootstrapResult } from "./bootstrap.ts";

export async function executeReviewStrategy(
  provider: PlatformProvider,
  currentRunSettings: OperationRunSettings,
  bootstrapData: BootstrapResult,
): Promise<OperationRunSettings> {
  /**
   * Review mode run settings.
   */
  let runSettings: OperationRunSettings = currentRunSettings;

  if (!bootstrapData.associatedProposalForCommit) {
    logger.subHeader(
      "Review mode execution (prepare): Creating/Updating release proposal (PR, MR, etc.)...",
    );
    runSettings = await executeReviewPreparePhase(
      provider,
      runSettings,
      bootstrapData,
    );
  } else if (runSettings.config.tag.createTag) {
    logger.subHeader(
      "Review mode execution (publish): Creating tag and release...",
    );
    runSettings = await executeReviewPublishPhase(
      provider,
      runSettings,
      bootstrapData.associatedProposalForCommit,
    );
  } else {
    logger.subHeader(
      "Review mode execution (publish): Skip create tag and release (disabled in config)",
    );
  }

  return runSettings;
}
