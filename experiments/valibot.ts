import * as v from "@valibot/valibot";
import console from "node:console";
import { indentLines } from "../src/utils/formatters/indent.ts";
import { formatValibotIssues } from "../src/utils/formatters/valibot.ts";

const InputsSchema = v.pipe(
  v.object({
    configPath: v.string(),
    configFormat: v.string(),

    configOverride: v.string(),
  }),
  v.check(
    (input) =>
      Boolean(input.configPath.trim()) || Boolean(input.configOverride.trim()),
    "Missing required input. Must set either `config-path` or `config-override`.",
  ),
  v.forward(
    v.partialCheck(
      [["configPath"], ["configFormat"]],
      (input) =>
        ((!!input.configPath && !!input.configFormat)
        || (!input.configPath && !input.configFormat)) && !!input.configPath,
      "Error, config format require if config path exist",
    ),
    ["configFormat"]
  ),
);

const obj1 = {
  configPath: "",
  configFormat: "",

  configOverride: "",
};

const obj2 = {
  configPath: "qw",
  configFormat: "",

  configOverride: "",
};

// console.log(v.safeParse(InputsSchema, obj1));
// console.log(v.safeParse(InputsSchema, obj2));

const res1 = v.safeParse(InputsSchema, obj1);
const res2 = v.safeParse(InputsSchema, obj2);

if (res1.issues && res2.issues) {
  // console.log(v.flatten<typeof InputsSchema>(res1.issues));
  // console.log(v.flatten<typeof InputsSchema>(res2.issues));

  // console.log("this is first: \n" + new v.ValiError(res1.issues));
  // console.log("this is second: \n" + new v.ValiError(res2.issues));

  // console.log(formatValibotIssues(res1.issues));
  console.log(formatValibotIssues(res2.issues));

  console.log("//////////////////////////////////////");
  
//  console.log(JSON.stringify(res1.issues, null, 2));
  console.log(JSON.stringify(res2.issues, null, 2));
}
