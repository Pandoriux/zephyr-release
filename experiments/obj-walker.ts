import "./deno-env-trace.ts"
import console from "node:console";
import { map } from "obj-walker";
import { toPascalCase } from "@std/text/to-pascal-case";

const json = `
{
  "Name": "Alice",
  "AGE": 25,
  "Address": {
    "City": "NYC",
    "Zip": "10001"
  },
  "Hobbies": [
    { "Type": "Sport", "Name": "Tennis" },
    { "Type": "Music", "Name": "Piano" }
  ]
}
`;

const jsonObj = JSON.parse(json)
// const jsonObj = [{name: "hi"}, {age: 12}]

// console.log(mapKeys(jsonObj, (s) => s.toUpperCase()))

const DEFAULT_COMMIT_TYPES = [
  { type: "feat", section: "Features" },
  { type: "fix", section: "Bug Fixes" },
  { type: "perf", section: "Performance Improvements" },
  { type: "revert", section: "Reverts" },
  // { type: "docs", section: "Documentation", hidden: true },
  // { type: "style", section: "Styles", hidden: true },
  // { type: "chore", section: "Miscellaneous Chores", hidden: true },
  // { type: "refactor", section: "Code Refactoring", hidden: true },
  // { type: "test", section: "Tests", hidden: true },
  // { type: "build", section: "Build System", hidden: true },
  // { type: "ci", section: "Continuous Integration", hidden: true },
]

const res = map(DEFAULT_COMMIT_TYPES, ({ val }) => {
    if (!val || typeof val !== "object" || Array.isArray(val)) return val;

    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [toPascalCase(k), v]),
    );

  }, { 
  postOrder: true,
  modifyInPlace: false
});

// console.log(JSON.stringify(transformObjKeyToKebabCase(DEFAULT_COMMIT_TYPES), null, 2))
console.log(JSON.stringify(res, null, 2))

