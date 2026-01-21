import fs from "node:fs";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { resolveSafeFilePath } from "../utils/validations/file-path.ts";
import type {
  SourceModeOption,
  SourceModeOptions,
} from "../constants/source-mode-options.ts";

type GetFileArgs =
  | {
    source: typeof SourceModeOptions.remote;
    provider: PlatformProvider;
    token: string;
    path: string;
  }
  | {
    source: typeof SourceModeOptions.local;
    workspace: string;
    path: string;
  };
// | {
//   source: SourceModeOption;
//   path: string;
//   provider: PlatformProvider;
//   token: string;
//   workspace: string;
// };

export async function getTextFileOrThrow(args: GetFileArgs): Promise<string> {
  switch (args.source) {
    case "remote":
      return await args.provider.getTextFileOrThrow(args.token, args.path);

    case "local": {
      const safePath = resolveSafeFilePath(args.workspace, args.path);

      if (!safePath) {
        throw new Error(
          `Permission Denied: Path ${args.path} is outside the repository.`,
        );
      }

      return fs.readFileSync(safePath, { encoding: "utf8" });
    }
  }
}
