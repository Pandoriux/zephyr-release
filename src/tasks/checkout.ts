import fs from "node:fs";
import path from "node:path";

export function isRepoCheckedOut(workspacePath: string): boolean {
  if (fs.existsSync(path.join(workspacePath, ".git"))) {
    return true;
  }

  return false;
}
