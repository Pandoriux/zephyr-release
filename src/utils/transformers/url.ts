const SLASH_NORMALIZE_REGEX = /[\\/]+/g;
const SLASH_TRIM_REGEX = /^\/|\/$/g;

/**
 * Joins multiple URL segments into a single path string.
 * Handles backslash conversion, multiple slash normalization,
 * and trims leading/trailing slashes from individual segments.
 */
export function joinUrlSegments(
  ...segments: (string | undefined | null)[]
): string {
  const urlParts: string[] = [];

  for (const seg of segments) {
    const trimSeg = seg?.trim();

    if (!trimSeg) continue;

    const cleanedSeg = trimSeg.replace(SLASH_NORMALIZE_REGEX, "/").replace(
      SLASH_TRIM_REGEX,
      "",
    );

    // If a segment was just "/" or " ", it becomes empty here
    if (cleanedSeg.length > 0) {
      urlParts.push(cleanedSeg);
    }
  }

  return urlParts.join("/");
}
