import { toKebabCase } from "@std/text/to-kebab-case";
import console from "node:console";

console.log(toKebabCase("bumpMinorPre1.0major"));
console.log(toKebabCase("bumpMinorPreMajor1.0"));
