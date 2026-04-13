import { parse } from "@std/semver/parse";

const v1 = "v2";
const v2 = "42.6.7.9.3-alpha";

console.log(parse(v1));
console.log(parse(v2));
