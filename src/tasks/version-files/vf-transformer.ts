import { JsonObjectNode, JsonParser } from "@croct/json5-parser";
import { parseDocument } from "@eemeli/yaml";
import { edit as editToml } from "@rainbowatcher/toml-edit-js/index";
import { getJsonPathArrayOrThrow } from "../../libs/nimma/get-path-array.ts";
import { toTomlPathString } from "../../libs/@rainbowatcher/toml-edit-js/to-path-string.ts";
import { parseFileStringOrThrow } from "../../utils/parsers/file.ts";
import type { FileFormat } from "../../constants/file-formats.ts";
import { updateJsonCstByPath } from "../../libs/@croct/json5-parser/update.ts";

/**
 * Update the value at the given JSONPath in a structured file string (json/jsonc/json5/yaml/toml),
 * preserving formatting, comments, and style. Returns the updated file content.
 */
export function updateVersionInStructuredFile(
  fileContent: string,
  format: Exclude<FileFormat, "txt">,
  jsonPathSelector: string,
  newVersion: string,
): string {
  const parsedData = parseFileStringOrThrow(fileContent, format);
  const pathArray = getJsonPathArrayOrThrow(parsedData, jsonPathSelector);

  switch (format) {
    case "json":
    case "jsonc":
    case "json5": {
      const root = JsonParser.parse(fileContent, JsonObjectNode);
      updateJsonCstByPath(root, pathArray, newVersion);
      return root.toString();
    }

    case "yaml": {
      const doc = parseDocument(fileContent);
      doc.setIn(pathArray, newVersion);
      return doc.toString();
    }

    case "toml":
      return editToml(fileContent, toTomlPathString(pathArray), newVersion);
  }
}
