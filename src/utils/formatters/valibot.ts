import * as v from "@valibot/valibot";
import { indentLines } from "./indent.ts";
import { toDisplayString } from "./display.ts";

export function formatValibotIssues(issues: v.BaseIssue<unknown>[]) {
  return issues.map((issue) => {
    const isSpecialCheckType = issue.type === "check" ||
      issue.type === "partial_check";

    let receivedValue = toDisplayString(issue.received);
    let expectedValue = issue.expected;

    if (isSpecialCheckType) {
      if (isSpecialCheckType && issue.path && issue.path.length > 0) {
        const derivedReceived = issue.path.reduce(
          (currentValue: unknown, pathItem) => {
            const key = pathItem.key;
            if (
              typeof currentValue === "object" &&
              currentValue !== null &&
              (typeof key === "string" ||
                typeof key === "number" ||
                typeof key === "symbol") &&
              key in currentValue
            ) {
              return (currentValue as Record<PropertyKey, unknown>)[key];
            }

            return undefined;
          },
          issue.input,
        );

        receivedValue = toDisplayString(derivedReceived);
        expectedValue = typeof derivedReceived;
      }
    }

    return (
      `Validation error: ${issue.message}\n` +
      indentLines(
        `Field: ${v.getDotPath(issue) || "root"}\n` +
          `Expected: ${expectedValue}\n` +
          `Received: ${receivedValue}`,
      )
    );
  }).join("\n");
}
