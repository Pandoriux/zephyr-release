import * as v from "@valibot/valibot";

const TestSchema = v.object({
  id: v.string("error id"),
  name: v.string("error name"),
}, "object fail");

const testObj = {
  id: 123,
  name: "Test Object",
};

const parsedObj = v.parse(TestSchema, testObj, {
  message: "Failed to parse test object",
});
