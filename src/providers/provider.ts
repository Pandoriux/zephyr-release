import process from "node:process";
import type { PlatformProvider } from "../types/platform-provider.ts";
import { ZephyrReleaseError } from "../errors/zephyr-release-error.ts";

export async function getProviderOrThrow(): Promise<PlatformProvider> {
  if (process.env.GITHUB_ACTIONS === "true") {
    return (await import("./github/github-provider.ts")).githubProvider;
  }

  // TODO: if requested enough
  //
  // if (process.env.GITLAB_CI === "true") {
  //   return "gitlab";
  // }

  throw new ZephyrReleaseError(
    "Unsupported execution environment: no supported platform detected.",
  );
}
