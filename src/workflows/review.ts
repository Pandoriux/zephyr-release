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

  if (!bootstrapData.associatedPrForCommit) {
    logger.subHeader(
      "Review mode execution: Creating/Updating release proposal pull request...",
    );
    runSettings = await executeReviewPreparePhase(
      provider,
      runSettings,
      bootstrapData,
    );
  } else if (runSettings.config.release.createTag) {
    logger.subHeader("Review mode execution: Creating tag and release...");
    runSettings = await executeReviewPublishPhase(
      provider,
      runSettings,
      bootstrapData.associatedPrForCommit,
    );
  } else {
    logger.subHeader(
      "Review mode execution: Skip create tag and release (disabled in config)",
    );
  }

  return runSettings;
}
