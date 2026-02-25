import * as v from "@valibot/valibot";

const enu = {
  foo: "foo",
  bar: "bar",
} as const;

const schema = v.object({
  prop: v.union([v.string(), v.enum(enu)]),
});

type input = v.InferInput<typeof schema>;
type output = v.InferOutput<typeof schema>;
