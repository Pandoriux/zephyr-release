export interface BaseOpVariables {
  // All
  target: "prepare" | "release";
  jobs: "create-pr" | "update-pr" | "create-release";
}

export interface Stage2 {
  // After calculate version and generate in-memory changelog
  nextVersion: string;
  changelog: string;

  // ...
}
