import { isAbsolute, relative, resolve } from "@std/path";

/**
 * Resolves a user-provided path against a base workspace and ensures
 * it does not traverse outside that workspace.
 * * @param workspace The root directory (e.g. GITHUB_WORKSPACE)
 * @param inputPath The potentially unsafe user input (e.g. "../../secret.txt")
 * @returns The absolute path if safe, or undefined if unsafe.
 */
export function resolveSafeFilePath(
  workspace: string,
  inputPath: string,
): string | undefined {
  if (!workspace || !inputPath) return undefined;

  // 1. Resolve to an absolute path
  // This handles ".", "..", and relative segments automatically
  const absoluteTarget = resolve(workspace, inputPath);

  // 2. Calculate the relative path from workspace to target
  // e.g. workspace="/a/b", target="/a/b/c" -> relative="c"
  // e.g. workspace="/a/b", target="/a/secret" -> relative="../secret"
  const resolvedRelativePath = relative(workspace, absoluteTarget);

  // 3. Security Check
  // A path is unsafe if:
  // - It starts with ".." (traverses up)
  // - It is absolute (occurs on Windows if drives differ, e.g., C: vs D:)
  const isUnsafe = resolvedRelativePath.startsWith("..") ||
    isAbsolute(resolvedRelativePath);

  if (isUnsafe) {
    return undefined;
  }

  return absoluteTarget;
}
