import { toKebabCase } from "@std/text";
import { join } from "@std/path";
import { toJsonSchema } from "@valibot/to-json-schema";
import traverse from "@json-schema-tools/traverse";
import { ConfigSchema } from "../src/schemas/configs/config.ts";

const OUTPUT_CONFIG_FILE = "config-v1.json";
const propertyKeyMap = new Map<string, string>();

// Config json schema based on valibot schema
const schema = toJsonSchema(ConfigSchema, {
  typeMode: "input",
  overrideSchema: (context) => {
    const schema = context.valibotSchema;

    if (schema && typeof schema === "object" && "key" in schema) {
      const schemaKey = schema.key;

      if (
        schemaKey &&
        typeof schemaKey === "object" &&
        "pipe" in schemaKey &&
        Array.isArray(schemaKey.pipe)
      ) {
        const isBaseSchemaString = schemaKey.pipe[0]?.type === "string";

        const hasTrim = schemaKey.pipe.some((action) =>
          action &&
          typeof action === "object" &&
          "type" in action &&
          action.type === "trim"
        );

        const hasNonEmpty = schemaKey.pipe.some((action) =>
          action &&
          typeof action === "object" &&
          "type" in action &&
          action.type === "non_empty"
        );

        if (isBaseSchemaString && hasTrim && hasNonEmpty) {
          return {
            type: "object",
            propertyNames: {
              type: "string",
              minLength: 1,
            },
            additionalProperties: {},
          };
        }
      }
    }
  },
  ignoreActions: ["trim", "safe_integer"],
});

// Transform function (from camelCase to kebab-case)
function transformKeys(
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
      "properties" in schema &&
      schema.properties &&
      typeof schema.properties === "object"
    ) {
      const props = Object.fromEntries(
        Object.entries(schema.properties).map(([k, v]) => {
          const kebabKey = toKebabCase(k);
          propertyKeyMap.set(k, kebabKey);
          return [kebabKey, v];
        }),
      );

      schema.properties = props;
    }

    // required
    if (
      "required" in schema &&
      Array.isArray(schema.required) &&
      schema.required.every((item) => typeof item === "string")
    ) {
      schema.required = schema.required.map((str) => toKebabCase(str));
    }
  }

  return schema;
}

function transformDescription(
  schema: unknown,
  _isCycle: boolean,
  _path: string,
  _parent: unknown,
) {
  if (schema && typeof schema === "object") {
    // description
    if ("description" in schema && typeof schema.description === "string") {
      schema.description = schema.description.replace(
        /`([^`]+)`/g,
        (match, content) => {
          const replacement = propertyKeyMap.get(content);
          if (!replacement) {
            return match;
          }

          return "`" + replacement + "`";
        },
      );
    }
  }

  return schema;
}

// Traverse and transform schema
traverse.default(schema, transformKeys, { mutable: true });
traverse.default(schema, transformDescription, { mutable: true });

// Write schema file
Deno.writeTextFileSync(
  join(import.meta.dirname!, `../schemas/${OUTPUT_CONFIG_FILE}`),
  JSON.stringify(
    schema,
    null,
    2,
  ),
);
