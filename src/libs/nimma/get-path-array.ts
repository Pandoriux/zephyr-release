import Nimma from "nimma";

/**
 * Resolve the path array for the first match of a JSONPath selector against data.
 * Library-specific: uses nimma's query callback `path` (array of keys/indices).
 */
export function getJsonPathArrayOrThrow(
  data: unknown,
  jsonPathSelector: string,
): (string | number)[] {
  let pathArray: (string | number)[] | undefined;

  Nimma.query(data, {
    [jsonPathSelector]({ path, value }) {
      if (value !== undefined && value !== null && pathArray === undefined) {
        pathArray = path;
      }
    },
  });

  if (pathArray == undefined) {
    throw new Error(
      `JSONPath '${jsonPathSelector}' did not match any node in the document`,
    );
  }

  return pathArray;
}
