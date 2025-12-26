import * as v from "@valibot/valibot";

const TestSchema = v.object({
  test: v.optional(
    v.object({
      name: v.optional(v.string(), "foo"),
      nickname: v.optional(v.string(), "bar"),
    }),
    {},
  ),
});

type Test = v.InferOutput<typeof TestSchema>;

const obj = {};

const parsed = v.parse(TestSchema, obj);

console.log(parsed);
