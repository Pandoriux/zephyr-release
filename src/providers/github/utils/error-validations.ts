import { isPlainObject } from "../../../utils/validations/object.ts";

export type GitHubErrorResponse = {
  status: number;
};

export function isGitHubErrorResponse(
  error: unknown,
): error is GitHubErrorResponse {
  if (!isPlainObject(error)) {
    return false;
  }
  
  return "status" in error && typeof error.status === "number";
}

