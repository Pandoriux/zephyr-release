import { taskLogger } from "../logger.ts";

const STRING_TEMPLATE_CACHE = new Map<string, string>();

export function resolveStringTemplate(
  strTemplate: string,
  stringPatternsContext: Record<string, string | undefined>,
): string {
  const cacheKey = `${strTemplate}:${JSON.stringify(stringPatternsContext)}`;
  const cachedTemplate = STRING_TEMPLATE_CACHE.get(cacheKey);
  if (cachedTemplate !== undefined) {
    return cachedTemplate;
  }

  // Replace patterns in the template
  // Pattern: ${patternName} or ${patternName:modifier(...)} or ${"literal":modifier(...)}
  const resolvedTemplate = strTemplate.replace(
    /\$\{([^}]+)\}/g,
    (match, patternContent) => {
      // Check if this is a dynamic pattern (contains ':')
      if (patternContent.includes(":")) {
        return handleDynamicStringPatterns(
          match,
          patternContent,
          stringPatternsContext,
        );
      }

      const value = stringPatternsContext[patternContent];

      // btter way to order this?
      if (!value) taskLogger.warn("");
      return value ?? "<!CANT RESOLVE>";
    },
  );

  // Cache the result
  STRING_TEMPLATE_CACHE.set(cacheKey, resolvedTemplate);
  return resolvedTemplate;
}

function handleDynamicStringPatterns(
  _match: string,
  _patternContent: string,
  _context: Record<string, string | undefined>,
): string {
  // TODO: design a good way to solve

  return "";
}
