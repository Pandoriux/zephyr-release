import { getSpaceCache } from "../caches/space.ts";

export function formatErrorHierarchy(
  error: unknown,
  step: number = 2,
  maxIndent: number = 20,
): string {
  if (error === null || error === undefined) return "";

  let result = "";
  let current: unknown = error;
  let level = 1;

  while (current !== null && current !== undefined) {
    // 1. Extract Message safely
    let message: string;
    if (current instanceof Error) {
      message = current.message;
    } else if (
      typeof current === "object" && "message" in current &&
      typeof current.message === "string"
    ) {
      message = current.message;
    } else {
      message = String(current);
    }

    // 2. Calculate Indentation
    let indentSize = level * step;
    if (indentSize > maxIndent) indentSize = maxIndent;

    // 3. Format Message
    const indentedMessage = message.replace(
      /^([ ]*)(.*)/gm,
      (_, __, content: string) => {
        return content.length === 0 ? "" : getSpaceCache(indentSize) + content;
      },
    );

    result += (result ? "\n" : "") + indentedMessage;

    // 4. Safely find the next '.cause'
    // We check if it's an object and contains the 'cause' key
    if (typeof current === "object" && current !== null && "cause" in current) {
      current = current.cause;
      level++;
    } else {
      break;
    }
  }

  return result;
}
