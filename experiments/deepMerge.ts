import { deepMerge } from "@std/collections";
import console from "node:console";

const obj1 = { name: "pan", age: 18, arr: [1, 2, 3] };
const obj2 = { note: "hello" };
const obj3 = { arr: [11, 22, 33] };

console.log("obj 1 + 2: " + JSON.stringify(deepMerge(obj1, obj2), null, 2));
console.log("obj 1 + 3: " + JSON.stringify(deepMerge(obj1, obj3), null, 2));
console.log("obj 3 + 1: " + JSON.stringify(deepMerge(obj3, obj1), null, 2));

console.log(
  "obj 1 + 3 arr replace: "
    + JSON.stringify(deepMerge(obj1, obj3, { arrays: "replace" }), null, 2),
);
console.log(
  "obj 3 + 1 arr replace: "
    + JSON.stringify(deepMerge(obj3, obj1, { arrays: "replace" }), null, 2),
);
