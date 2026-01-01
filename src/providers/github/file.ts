import fs from "node:fs";
import path from "node:path";

export async function githubGetTextFileOrThrow(
  workspacePath: string,
  filePath: string,
): Promise<string> {
  // NOTE: local dev behavior for now: read from disk.
  // TODO(platform): swap this to GitHub API fetch (contents) later.
  return fs.readFileSync(path.join(workspacePath, filePath), {
    encoding: "utf8",
  });
}
