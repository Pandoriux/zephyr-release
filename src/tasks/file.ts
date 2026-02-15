import fs from "node:fs";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { resolveSafeFilePath } from "../utils/validations/file-path.ts";
import type {
  SourceModeOption,
  SourceModeOptions,
} from "../constants/source-mode-options.ts";

export async function getTextFileOrThrow(
  source: typeof SourceModeOptions.remote,
  path: string,
  options: { provider: PlatformProvider; ref?: string },
): Promise<string>;
export async function getTextFileOrThrow(
  source: typeof SourceModeOptions.local,
  path: string,
  options: { workspace: string },
): Promise<string>;
export async function getTextFileOrThrow(
  source: SourceModeOption,
  path: string,
  options: { provider: PlatformProvider; workspace: string; ref?: string },
): Promise<string>;

export async function getTextFileOrThrow(
  source: SourceModeOption,
  path: string,
  opts: { provider?: PlatformProvider; workspace?: string; ref?: string },
): Promise<string> {
  switch (source) {
    case "remote": {
      if (!opts.provider) {
        throw new Error("Provider is required for remote source.");
      }
      return await opts.provider.getTextFileOrThrow(path, opts.ref);
    }

    case "local": {
      if (!opts.workspace) {
        throw new Error("Workspace is required for local source.");
      }

      const safePath = resolveSafeFilePath(opts.workspace, path);
      if (!safePath) {
        throw new Error(
          `Permission Denied: Path ${path} is outside the repository.`,
        );
      }

      return fs.readFileSync(safePath, { encoding: "utf8" });
    }
  }
}
