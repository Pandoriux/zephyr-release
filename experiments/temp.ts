import * as v from "@valibot/valibot";

const result = v.parse(
  v.pipe(v.string(), v.hexColor()),
  "#ededed",
);

console.log(result); // "example label"
