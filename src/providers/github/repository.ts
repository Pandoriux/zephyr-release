import process from "node:process";

export function githubGetHost(): string {
  return "https://github.com";
}

export function githubGetNamespace(): string {
  return process.env.GITHUB_REPOSITORY?.split("/")[0] ?? "";
}

export function githubGetRepositoryName(): string {
  return process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
}

export function githubGetCommitPathPart(): string {
  return "commit";
}

export function githubGetReferencePathPart(): string {
  return "issues";
}
