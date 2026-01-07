export function isPlainObject(
  input: unknown,
): input is Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }

  const proto = Object.getPrototypeOf(input);
  return proto === Object.prototype || proto === null;
}
