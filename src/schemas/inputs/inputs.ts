import * as v from "@valibot/valibot";
import { ConfigFileFormatsWithAuto } from "../../constants/file-formats.ts";

export const InputsSchema = v.pipe(
  v.object({
    workspacePath: v.pipe(v.string(), v.nonEmpty("Workspace not found.")),
    token: v.pipe(v.string(), v.nonEmpty("Token is missing.")),

    configPath: v.string(),
    configFormat: v.enum(ConfigFileFormatsWithAuto),

    configOverride: v.string(),
    configOverrideFormat: v.enum(ConfigFileFormatsWithAuto),
  }),
  // custom checks
  v.forward(
    v.partialCheck(
      [["configPath"], ["configOverride"]],
      (input) =>
        Boolean(input.configPath.trim()) ||
        Boolean(input.configOverride.trim()),
      "At least one of `config-path` or `config-override` is required.",
    ),
    ["configPath"],
  ),
  v.forward(
    v.partialCheck(
      [["configPath"], ["configOverride"]],
      (input) =>
        Boolean(input.configPath.trim()) ||
        Boolean(input.configOverride.trim()),
      "At least one of `config-path` or `config-override` is required.",
    ),
    ["configOverride"],
  ),
);

type _InputsInput = v.InferInput<typeof InputsSchema>;
export type InputsOutput = v.InferOutput<typeof InputsSchema>;
