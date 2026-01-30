import * as v from "@valibot/valibot";
import { taskLogger } from "./logger.ts";
import { type InputsOutput, InputsSchema } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { formatValibotIssues } from "../utils/formatters/valibot.ts";
import { transformObjKeyToCamelCase } from "../utils/transformers/object.ts";

export function getInputsOrThrow(provider: PlatformProvider): InputsOutput {
  const rawInputs = provider.getRawInputs();
  const processedRawInputs = rawInputs.sourceMode
    ? {
      ...rawInputs,
      sourceMode: transformObjKeyToCamelCase(JSON.parse(rawInputs.sourceMode)),
    }
    : rawInputs;

  const parsedInputsResult = v.safeParse(InputsSchema, processedRawInputs);
  if (!parsedInputsResult.success) {
    throw new Error(
      `\`${getInputsOrThrow.name}\` failed!` +
        formatValibotIssues(parsedInputsResult.issues),
    );
  }

  taskLogger.startGroup("Parsed inputs:");
  taskLogger.info(JSON.stringify(parsedInputsResult.output, null, 2));
  taskLogger.endGroup();

  return parsedInputsResult.output;
}
