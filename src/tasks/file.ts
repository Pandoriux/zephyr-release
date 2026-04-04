import fs from "node:fs";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { resolveSafeFilePath } from "../utils/validations/file-path.ts";
import type {
  SourceModeOption,
  SourceModeOptions,
} from "../constants/source-mode-options.ts";
import { FileNotFoundError } from "../errors/file.ts";

/** @throws */
export async function getTextFile(
  source: typeof SourceModeOptions.remote,
  path: string,
  options: { provider: PlatformProvider; ref?: string },
): Promise<string>;
export async function getTextFile(
  source: typeof SourceModeOptions.local,
  path: string,
  options: { workspacePath: string },
): Promise<string>;
export async function getTextFile(
  source: SourceModeOption,
  path: string,
  options: { provider: PlatformProvider; workspacePath: string; ref?: string },
): Promise<string>;

export async function getTextFile(
  source: SourceModeOption,
  path: string,
  opts: { provider?: PlatformProvider; workspacePath?: string; ref?: string },
): Promise<string> {
  switch (source) {
    case "remote": {
      if (!opts.provider) {
        throw new Error("Provider is required for remote source.");
      }
      return await opts.provider.getTextFile(path, opts.ref);
    }

    case "local": {
      if (!opts.workspacePath) {
        throw new Error("Workspace is required for local source.");
      }

      const safePath = resolveSafeFilePath(opts.workspacePath, path);
      if (!safePath) {
        throw new Error(
          `Permission Denied: Path ${path} is outside the repository.`,
        );
      }

      try {
        return fs.readFileSync(safePath, { encoding: "utf8" });
      } catch (error) {
        if (
          error instanceof Error && "code" in error && error.code === "ENOENT"
        ) {
          throw new FileNotFoundError(`Path '${safePath}' not found locally.`);
        }

        throw error;
      }
    }
  }
}
