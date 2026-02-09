/**
 * Parse a selector string into a RegExp.
 * Accepts either /pattern/flags (e.g. /"version"\s*:\s*"([^"]+)"/) or a raw pattern string.
 * @throws Error if the pattern is invalid
 */
export function parseRegExpFromSelector(selector: string): RegExp {
  const matchArray = selector.match(/^\/(.*)\/([gimyus]*)$/);

  try {
    if (matchArray) {
      const pattern = matchArray[1] ?? selector;
      const flags = matchArray[2];
      return new RegExp(pattern, flags);
    }

    return new RegExp(selector);
  } catch (error) {
    throw new Error(`Invalid Regular Expression syntax: ${selector}`, {
      cause: error,
    });
  }
}
