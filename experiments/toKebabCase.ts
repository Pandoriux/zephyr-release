import { toKebabCase,  } from "@std/text";
import { toTitleCase } from "@std/text/unstable-to-title-case";
import console from "node:console";

console.log(toKebabCase("bumpMinorPre1.0major"));
console.log(toKebabCase("bumpMinorPreMajor1.0"));

console.log(toTitleCase("thisIsGood."));
console.log(toTitleCase("BloodTest."));

