import { parse } from "nimma/parser";
import Nimma from "nimma";
import {
  type VersionFileExtractor,
  VersionFileExtractorsWithAuto,
  type VersionFileExtractorWithAuto,
} from "../../constants/version-file-options.ts";

function detectVersionFileExtractor(
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
    parse(selector);
    return "json-path";
  } catch {
    try {
      new RegExp(selector);
      return "regex";
    } catch { /*ignore*/ }
  }

  return undefined;
}

export function extractVersionStringOrThrow(
  parsedVersionFile: unknown,
  extractor: VersionFileExtractorWithAuto,
  selector: string,
): string | undefined {
  if (!parsedVersionFile) {
    throw new Error(
      "Cannot extract version, parsed version file content is empty or invalid",
    );
  }

  const validExtractor = extractor === VersionFileExtractorsWithAuto.auto
    ? detectVersionFileExtractor(selector)
    : extractor;
  if (!validExtractor) {
    throw new Error(
      `Unable to determine a version file extractor for selector '${selector}'`,
    );
  }

  switch (validExtractor) {
    case "json-path": {
      let result: string | undefined;

      try {
        const nimma = new Nimma([selector]);
        nimma.query(parsedVersionFile, {
          [selector]({ value }) {
            // Only assign if we haven't found a result yet and value is not null/undefined
            if (value !== undefined && value !== null && result === undefined) {
              result = String(value);
            }
          },
        });
      } catch (error) {
        throw new Error(
          `Invalid JSONPath syntax: '${selector}'`,
          { cause: error },
        );
      }

      return result;
    }

    case "regex": {
      const content = JSON.stringify(parsedVersionFile, null, 2);

      // Handle /pattern/flags format or raw strings const match = selector.match(/^\/(.*)\/([gimyus]*)$/);
      const matchArray = selector.match(/^\/(.*)\/([gimyus]*)$/);

      let regex: RegExp;
      try {
        if (matchArray) {
          const pattern = matchArray[1] ?? selector;
          const flags = matchArray[2];
          regex = new RegExp(pattern, flags);
        } else {
          regex = new RegExp(selector);
        }
      } catch (error) {
        throw new Error(`Invalid Regular Expression syntax: ${selector}`, {
          cause: error,
        });
      }

      const executionMatch = content.match(regex);
      if (!executionMatch) {
        return undefined;
      }

      // Safe access: match[1] is the first capture group, match[0] is the whole string
      return executionMatch[1] ?? executionMatch[0];
    }
  }
}
