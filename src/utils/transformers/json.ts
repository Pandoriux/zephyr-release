export function jsonValueNormalizer(k: string, v: unknown) {
  // Allow all natively supported JSON-compatible values to pass through
  if (
    v === null ||
    typeof v === "string" ||
    typeof v === "boolean" ||
    (typeof v === "number" && Number.isFinite(v)) ||
    Array.isArray(v) ||
    typeof v === "object"
  ) {
    return v;
  }

  // Handle Infinity
  if (v === Infinity) {
    return "Infinity";
  }
  if (v === -Infinity) {
    return "-Infinity";
  }

  /* -------------------------------------------------------------------------- */
  /* These values throw an error because we don't have a specific use case for  */
  /* them yet (e.g., BigInt, NaN, Symbols, Functions, Undefined).               */
  /* We keep the throw error here so that if we need to support them in the     */
  /* future, the error will remind us to implement the correct normalization    */
  /* logic rather than letting them fail silently or be omitted.                */
  /* -------------------------------------------------------------------------- */

  throw new Error(
    `Normalization Error: The value for key "${
      k || "(root)"
    }" (type: ${typeof v}) is not supported for normalizing yet. Value: ${
      String(v)
    }`,
  );
}
