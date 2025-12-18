import * as v from "@valibot/valibot";
import {
  FileFormatAliases,
  FileFormats,
} from "../../constants/file-formats.ts";

export const InputsSchema = v.pipe(
  v.object({
    workspace: v.pipe(v.string(), v.nonEmpty("Workspace not found.")),
    token: v.pipe(v.string(), v.nonEmpty("Token is missing.")),

    configPath: v.string(),
    configFormat: v.union([v.enum(FileFormats), v.enum(FileFormatAliases)]),

    configOverride: v.string(),
    configOverrideFormat: v.enum(FileFormats),
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
type _InputsOutput = v.InferOutput<typeof InputsSchema>;
