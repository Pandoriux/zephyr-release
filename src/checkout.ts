import fs from "node:fs";
import path from "node:path";
import { exitFailure } from "./lifecycle.ts";

export function throwIfRepoNotCheckedOut(workspace: string) {
  if (!fs.existsSync(path.join(workspace, ".git"))) {
    exitFailure(
      "Repository not checked out. See: https://github.com/actions/checkout",
    );
  }
}
