import { toKebabCase } from "@std/text";
import { join } from "@std/path";
import { toJsonSchema } from "@valibot/to-json-schema";
import traverse from "@json-schema-tools/traverse";
import { ConfigSchema } from "../src/schemas/configs/config.ts";

const OUTPUT_CONFIG_FILE = "config-v1.json";

// Config json schema based on valibot schema
const schema = toJsonSchema(ConfigSchema, {
  typeMode: "input",
});

// Transform function (schema keys from camelCase to kebab-case)
function transform(
  schema: unknown,
  _isCycle: boolean,
  _path: string,
  _parent: unknown,
) {
  if (schema && typeof schema === "object") {
    // defs
    if (
      "$defs" in schema && schema.$defs && typeof schema.$defs === "object"
    ) {
      const defs = Object.fromEntries(
        Object.entries(schema.$defs).map(([k, v]) => [toKebabCase(k), v]),
      );

      schema.$defs = defs;
    }

    // refs
    if ("$ref" in schema && typeof schema.$ref === "string") {
      if (schema.$ref.startsWith("#")) {
        const parts = schema.$ref.split("/");
        parts[parts.length - 1] = toKebabCase(parts[parts.length - 1]);

        schema.$ref = parts.join("/");
      }
    }

    // properties
    if (
      "properties" in schema
      && schema.properties
      && typeof schema.properties === "object"
    ) {
      const props = Object.fromEntries(
        Object.entries(schema.properties).map(([k, v]) => [toKebabCase(k), v]),
      );

      schema.properties = props;
    }

    // required
    if (
      "required" in schema
      && Array.isArray(schema.required)
      && schema.required.every((item) => typeof item === "string")
    ) {
      schema.required = schema.required.map((str) => toKebabCase(str));
    }
  }

  return schema;
}

// Traverse and transform schema keys
traverse.default(schema, transform, { mutable: true });

// Write schema file
Deno.writeTextFileSync(
  join(import.meta.dirname!, `../schemas/${OUTPUT_CONFIG_FILE}`),
  JSON.stringify(
    schema,
    null,
    2,
  ),
);
