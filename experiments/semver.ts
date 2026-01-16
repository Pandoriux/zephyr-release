import { canParse, format, increment, parse, tryParse } from "@std/semver";
import console from "node:console";

const semver = "1.2.3";
const semverPrefix = " v1.2.3     ";
const semverInvalid = "1ee.2.3";
const semverPre = "1.2.3-pre.1";
const semverBld = "1.2.3+build.1.build2.damn";
const semverFull = "1.2.3-pre.1.pre2.hehe+build.1.build2.damn";

// console.log(canParse(semverPrefix));
// console.log(format(parse(semverFull)));

const obj = parse(semverFull);
obj.prerelease?.push("1");

console.log(obj);

const newObj = parse(format(obj));
console.log(newObj);

// console.log("increment: " + format(increment(parse(semverPre), "preminor", {prerelease: "pre.1", build: "test.demo"})))
