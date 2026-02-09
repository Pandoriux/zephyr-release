import * as v from "@valibot/valibot";

const GitHubErrorResponseSchema = v.object({
  status: v.number(),
});

export type GitHubErrorResponse = v.InferOutput<typeof GitHubErrorResponseSchema>;

export function isGitHubErrorResponse(
  error: unknown,
): error is GitHubErrorResponse {
  try {
    const parsed = v.parse(GitHubErrorResponseSchema, error, {
      message: "Received malformed error response from GitHub REST API",
    });

    return typeof parsed.status === "number";
  } catch {
    return false;
  }
}

