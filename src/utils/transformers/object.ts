import { toCamelCase, toKebabCase } from "@std/text";
import { map } from "obj-walker";

export function transformObjKeyToKebabCase(
  obj: unknown,
  mutate: boolean = false,
): unknown {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  return map(obj, ({ val }) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return Object.fromEntries(
        Object.entries(val).map(([k, v]) => [toKebabCase(k), v]),
      );
    } else {
      return val;
    }
  }, {
    postOrder: true,
    modifyInPlace: mutate,
  });
}

export function transformObjKeyToCamelCase(
  obj: unknown,
  mutate: boolean = false,
): unknown {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  return map(obj, ({ val }) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return Object.fromEntries(
        Object.entries(val).map(([k, v]) => [toCamelCase(k), v]),
      );
    } else {
      return val;
    }
  }, {
    postOrder: true,
    modifyInPlace: mutate,
  });
}
