import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import {
  setupWorkingBranchOrThrow,
  type WorkingBranchResult,
} from "../tasks/branch.ts";
import { logger } from "../tasks/logger.ts";
import { validateCurrentOperationTriggerCtxOrExit } from "../tasks/operation.ts";
import {
  findProposalForCommitOrThrow,
  findProposalFromBranchOrThrow,
} from "../tasks/proposal.ts";
import {
  createCustomStringPatternContext,
  createFixedBaseStringPatternContext,
} from "../tasks/string-templates-and-patterns/pattern-context.ts";
import { registerTransformersToTemplateEngine } from "../tasks/string-templates-and-patterns/transformers.ts";
import type { OperationTriggerContext } from "../types/operation-context.ts";
import type { ProviderInputs } from "../types/providers/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import type { ProviderProposal } from "../types/providers/proposal.ts";

export interface BootstrapResult {
  triggerContext: OperationTriggerContext;
  workingBranchResult: WorkingBranchResult;
  associatedProposalForCommit: ProviderProposal | undefined;
  associatedProposalFromBranch: ProviderProposal | undefined;
}

export async function bootstrapOperation(
  provider: PlatformProvider,
  configResult: { rawConfig: object; config: ConfigOutput },
  inputsResult: { rawInputs: ProviderInputs; inputs: InputsOutput },
): Promise<BootstrapResult> {
  logger.stepStart("Starting: Parse and validate current trigger context");
  const triggerContext = validateCurrentOperationTriggerCtxOrExit(
    provider,
    configResult.config.commitTypes,
    configResult.config.mode,
  );
  logger.stepFinish("Finished: Parse and validate current trigger context");

  logger.stepStart("Starting: Register transformers to template engine");
  registerTransformersToTemplateEngine(provider);
  logger.stepFinish("Finished: Register transformers to template engine");

  logger.debugStepStart("Starting: Create custom string pattern context");
  createCustomStringPatternContext(configResult.config.customStringPatterns);
  logger.debugStepFinish("Finished: Create custom string pattern context");

  logger.debugStepStart("Starting: Create fixed base string pattern context");
  await createFixedBaseStringPatternContext(
    provider,
    inputsResult.inputs.triggerBranchName,
    configResult.config,
  );
  logger.debugStepFinish("Finished: Create fixed base string pattern context");

  logger.stepStart("Starting: Ensure working branch is prepared");
  const workingBranchResult = await setupWorkingBranchOrThrow(
    provider,
    inputsResult.inputs,
    configResult.config,
  );
  logger.stepFinish("Finished: Ensure working branch is prepared");

  let associatedProposalForCommit: ProviderProposal | undefined;
  let associatedProposalFromBranch: ProviderProposal | undefined;
  if (configResult.config.mode === "review") {
    logger.stepStart("Starting: Get associated proposals");
    associatedProposalForCommit = await findProposalForCommitOrThrow(
      provider,
      workingBranchResult.name,
      inputsResult.inputs,
      configResult.config,
    );
    associatedProposalFromBranch = await findProposalFromBranchOrThrow(
      provider,
      workingBranchResult.name,
      inputsResult.inputs,
      configResult.config,
    );
    logger.stepFinish("Finished: Get associated proposals");
  }

  return {
    triggerContext,
    workingBranchResult,
    associatedProposalForCommit,
    associatedProposalFromBranch,
  };
}
