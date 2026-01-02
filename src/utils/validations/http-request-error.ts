export function isHttpRequestError(
  error: unknown,
): error is { status: number; message: string } {
  return (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  );
}
