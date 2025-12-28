import process from "node:process";
import type { PlatformProvider } from "../types/platform-provider.ts";

export async function getProviderOrThrow(): Promise<PlatformProvider> {
  if (process.env.GITHUB_ACTIONS === "true") {
    return (await import("./github/github-provider.ts")).githubProvider;
  }

  // TODO: if requested enough
  //
  // if (process.env.GITLAB_CI === "true") {
  //   return "gitlab";
  // }

  throw new Error(
    "Unsupported execution environment (no supported platform detected)",
  );
}
