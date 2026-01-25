import { taskLogger } from "../logger.ts";
import { FIXED_STR_PAT_CTX } from "./string-pattern-context.ts";

const RESOLVED_FIXED_STRING_TEMPLATE_CACHE = new Map<string, string>();

export function resolveStringTemplate(
  strTemplate: string,
): string {
  const cachedTemplate = RESOLVED_FIXED_STRING_TEMPLATE_CACHE.get(strTemplate);
  if (cachedTemplate !== undefined) {
    return cachedTemplate;
  }

  // Replace patterns in the template
  // Pattern: ${patternName} or ${patternName:modifier(...)} or ${"literal":modifier(...)}
  const resolvedTemplate = strTemplate.replace(
    /\$\{([^}]+)\}/g,
    (match, patternContent) => {
      const fixedValue = handleFixedStringPatterns(patternContent);
      if (fixedValue !== undefined) return fixedValue;

      //dynamic?

      // derived??
      if (patternContent.includes(":")) {
        const derivedValue = handleDerivedStringPatterns(
          match,
          patternContent,
        );
        if (derivedValue !== undefined) return derivedValue;
      }

      taskLogger.info(
        `Cannot resolve pattern '${match}' for string template '${strTemplate}'`,
      );

      return match;
    },
  );

  // Cache the result, only apply to fixed pattern, might need to fix code later
  RESOLVED_FIXED_STRING_TEMPLATE_CACHE.set(strTemplate, resolvedTemplate);

  return resolvedTemplate;
}

function handleFixedStringPatterns(
  patternContent: string,
): string | undefined {
  return FIXED_STR_PAT_CTX[patternContent];
}

function handleDynamicStringPatterns(
  _match: string,
  _patternContent: string,
): string {
  // TODO: design a good way to solve

  return "";
}

function handleDerivedStringPatterns(
  _match: string,
  _patternContent: string,
): string | undefined {
  // TODO: design a good way to solve

  return undefined;
}
