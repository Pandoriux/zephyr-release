import parser from "nimma/parser";
import Nimma from "nimma";
import type { VersionFileExtractor } from "../../constants/version-file-options.ts";
import { parseRegExpFromSelector } from "../../utils/parsers/regex.ts";

/**
 * Detect version file extractor type from selector
 */
export function detectVersionFileExtractor(
  selector: string,
): VersionFileExtractor | undefined {
  if (
    selector.startsWith("$") || selector.includes("..") ||
    selector.includes("[*]")
  ) {
    return "json-path";
  }

  if (/^\/.*\/[gimyus]*$/.test(selector)) {
    return "regex";
  }

  try {
    parser(selector);
    return "json-path";
  } catch {
    try {
      new RegExp(selector);
      return "regex";
    } catch { /*ignore*/ }
  }

  return undefined;
}

/**
 * Extract version string from parsed version file content
 */
export function extractVersionStringOrThrow(
  parsedVersionFile: unknown,
  extractor: VersionFileExtractor,
  selector: string,
): string | null | undefined {
  if (!parsedVersionFile) {
    throw new Error(
      "Cannot extract version, parsed version file content is empty or invalid",
    );
  }

  switch (extractor) {
    case "json-path": {
      let result: string | null | undefined;

      Nimma.query(parsedVersionFile, {
        [selector]({ value }) {
          // Only assign if we haven't found a result yet and value is not null/undefined
          // Nimma may fire this callback multiple times if the selector matches many nodes.
          // We use 'result === undefined' to enforce "First Match Wins" logic.
          if (
            value !== undefined &&
            (typeof value === "string" || value === null) &&
            result === undefined
          ) {
            result = value;
          }
        },
      });

      return result;
    }

    case "regex": {
      const content = JSON.stringify(parsedVersionFile, null, 2);
      const regex = parseRegExpFromSelector(selector);

      const executionMatch = content.match(regex);
      if (!executionMatch) {
        return undefined;
      }

      // Safe access: match[1] is the first capture group, match[0] is the whole string
      return executionMatch[1] ?? executionMatch[0];
    }
  }
}
