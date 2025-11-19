import fs from "node:fs";
import path from "node:path";
import { manualExit } from "./main.ts";

export function throwIfRepoNotCheckedOut(workspace: string) {
  if (!fs.existsSync(path.join(workspace, ".git"))) {
    manualExit(
      "Repository not checked out. See: https://github.com/actions/checkout",
    );
  }
}
