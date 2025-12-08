import { toKebabCase } from "@std/text";
import { map } from "obj-walker";

export function transformObjKeyToKebabCase(
  obj: object,
  mutate: boolean = false,
) {
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
