import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import { logger } from "../tasks/logger.ts";
import { createTagOrThrow } from "../tasks/tag.ts";
import type { OperationTriggerContext } from "../types/operation-context.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";

interface ReleaseWorkflowOptions {
  operationContext: OperationTriggerContext;
  inputs: InputsOutput;
  config: ConfigOutput;
}

export async function releaseWorkflow(
  provider: PlatformProvider,
  ops: ReleaseWorkflowOptions,
) {
  const { operationContext, inputs, config } = ops;

  // read pr and get release note

  // set base pattern

  // run pre cmds

  logger.stepStart("Starting: Create tag");
  const createdTag = await createTagOrThrow(provider, inputs.triggerCommitHash);
  logger.stepFinish("Finished: Create tag");

  // create release note

  // run post cmds
}
