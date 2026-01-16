import type { ConfigOutput } from "../schemas/configs/config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { BaseOperationVariables } from "../types/operation-variables.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { jsonValueNormalizer } from "../utils/transformers/json.ts";
import { transformObjKeyToKebabCase } from "../utils/transformers/object.ts";
import { taskLogger } from "./logger.ts";

export function exportBaseOperationVariables(
  provider: PlatformProvider,
  inputs: InputsOutput,
  config: ConfigOutput,
  isCommitPr: boolean,
  workingPrExist: boolean,
) {
  const resolvedTarget = isCommitPr ? "release" : "prepare";
  const resolvedJob = resolvedTarget === "release"
    ? "create-release"
    : workingPrExist
    ? "update-pr"
    : "create-pr";

  const prepareExportObject = {
    inputs: transformObjKeyToKebabCase(inputs),
    config: transformObjKeyToKebabCase(config),

    inputsCamelCase: inputs,
    configCamelCase: config,

    target: resolvedTarget,
    job: resolvedJob,
  } satisfies BaseOperationVariables;

  taskLogger.debugWrap((dLogger) => {
    dLogger.startGroup(
      "Base operation variables to export (internal key name):",
    );
    dLogger.info(JSON.stringify(prepareExportObject, jsonValueNormalizer, 2));
    dLogger.endGroup();
  });

  provider.exportVariables(prepareExportObject);
}
