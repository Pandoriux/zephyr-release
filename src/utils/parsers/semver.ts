import { canParse, parse, type SemVer } from "@std/semver";

/**
 * Coerces a string into a valid SemVer object by extracting the first
 * semver-like sequence of numbers.
 * Mimics the behavior of `semver.coerce()` from npm.
 * * @example
 * parseLooseSemVer("v1.2.3") // 1.2.3
 * parseLooseSemVer("release-2.0") // 2.0.0
 * parseLooseSemVer("wip-deploy") // null
 */
export function parseLooseSemVer(
  version: string | number | null | undefined,
  includeExtensions = false,
): SemVer | undefined {
  if (version === null || version === undefined) return undefined;
  const vStr = String(version);

  // Match 1: Major
  // Match 2: Minor (optional)
  // Match 3: Patch (optional)
  // Match 4: Prerelease (optional)
  // Match 5: Build metadata (optional)
  const regex =
    /(?:^|[^\d])(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?/;
  const match = vStr.match(regex);

  if (!match) return undefined;

  const major = match[1];
  const minor = match[2] || "0";
  const patch = match[3] || "0";

  // Only include prerelease/build metadata if explicitly requested,
  // matching standard npm semver.coerce behavior.
  const prerelease = includeExtensions && match[4] ? `-${match[4]}` : "";
  const build = includeExtensions && match[5] ? `+${match[5]}` : "";

  const cleanVersion = `${major}.${minor}.${patch}${prerelease}${build}`;

  // Let @std/semver do the strict validation
  if (canParse(cleanVersion)) {
    return parse(cleanVersion);
  }

  return undefined;
}
