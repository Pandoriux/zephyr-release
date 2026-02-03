import type { JsonObjectNode } from "@croct/json5-parser";

interface HasGet {
  get(key: string | number): unknown;
}

interface HasSet {
  set(name: string | number, value: unknown): void;
}

function hasGet(o: unknown): o is HasGet {
  if (typeof o !== "object" || o === null) return false;
  const g = Reflect.get(o, "get");
  return typeof g === "function";
}

function hasSet(o: unknown): o is HasSet {
  if (typeof o !== "object" || o === null) return false;
  const s = Reflect.get(o, "set");
  return typeof s === "function";
}

/**
 * Update a value in a JSON/JSON5/JSONC CST by path array. Mutates the root in place.
 * Root is assumed to be an object (JsonObjectNode); path[0] is the first key.
 */
export function updateJsonCstByPath(
  root: JsonObjectNode,
  pathArray: (string | number)[],
  newValue: string,
): void {
  const lastIndex = pathArray.length - 1;
  if (lastIndex < 0) return;

  let current: unknown = root;
  for (let i = 0; i < lastIndex; i++) {
    const seg = pathArray[i];
    if (seg === undefined) {
      throw new Error(`Path segment at index ${i} is undefined`);
    }
    if (!hasGet(current)) {
      throw new Error(`Path segment ${i} (${String(seg)}): node has no get`);
    }
    current = current.get(seg);
  }

  const lastSeg = pathArray[lastIndex];
  if (lastSeg === undefined) {
    throw new Error(`Path segment at index ${lastIndex} is undefined`);
  }

  if (!hasSet(current)) {
    throw new Error("Target node has no set method");
  }
  current.set(lastSeg, newValue);
}
