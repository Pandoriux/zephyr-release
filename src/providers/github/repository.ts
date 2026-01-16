import process from "node:process";

export function githubGetNamespace(): string {
  return process.env.GITHUB_REPOSITORY?.split("/")[0] ?? "";
}

export function githubGetRepositoryName(): string {
  return process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
}
