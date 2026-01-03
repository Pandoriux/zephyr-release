import type {
  OperationJob,
  OperationTarget,
} from "../constants/operation-variables.ts";

export interface BaseOpVariables {
  target: OperationTarget;
  jobs: OperationJob[];
}

export interface Stage2 {
  // After calculate version and generate in-memory changelog
  nextVersion: string;
  changelog: string;

  // ...
}
