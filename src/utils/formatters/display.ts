export function toDisplayString(val: unknown) {
  if (typeof val === "string") return `"${val}"`;

  if (typeof val === "bigint") return `${val}n`;

  if (val === null) return "null";

  if (val === undefined) return "undefined";

  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return "[Object]";
    }
  }

  return String(val);
}
