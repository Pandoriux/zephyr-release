import { toCamelCase, toKebabCase } from "@std/text";
import { map } from "obj-walker";
import { isPlainObject } from "../validations/object.ts";

export function transformObjKeyToKebabCase(
  obj: unknown,
  mutate: boolean = false,
): unknown {
  if (!isPlainObject(obj)) {
    throw new Error(`'${transformObjKeyToKebabCase.name}' error: expected a plain object input`);
  }

  return map(obj, ({ val }) => {
    if (isPlainObject(val)) {
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
  if (!isPlainObject(obj)) {
    throw new Error(`'${transformObjKeyToCamelCase.name}' error: expected a plain object input`);
  }

  return map(obj, ({ val }) => {
    if (isPlainObject(val)) {
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
