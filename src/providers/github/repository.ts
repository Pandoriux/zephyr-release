import * as github from "@actions/github";

export function githubGetNamespace(): string {
  return github.context.repo.owner;
}

export function githubGetRepositoryName(): string {
  return github.context.repo.repo;
}
