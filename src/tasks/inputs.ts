import * as v from "@valibot/valibot";
import { logger } from "./logger.ts";
import { type InputsOutput, InputsSchema } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/platform-provider.ts";
import { formatValibotIssues } from "../utils/formatters/valibot.ts";

export function getInputsOrThrow(provider: PlatformProvider): InputsOutput {
  const rawInputs = provider.getRawInputs();

  const parsedInputsResult = v.safeParse(InputsSchema, rawInputs);
  if (!parsedInputsResult.success) {
    throw new Error(
      `\`${getInputsOrThrow.name}\`: ${
        formatValibotIssues(parsedInputsResult.issues)
      }`,
    );
  }

  logger.startGroup("Parsed inputs:");
  logger.info(JSON.stringify(parsedInputsResult.output, null, 2));
  logger.endGroup();

  return parsedInputsResult.output;
}
