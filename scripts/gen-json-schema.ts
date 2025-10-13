import { join } from "@std/path";
import { toJsonSchema } from "@valibot/to-json-schema";
import { ConfigSchema } from "../src/types/configs/config.ts";
import { TimeZoneSchema } from "../src/types/timezone.ts";

// Generate json schema based on valibot config schema
Deno.writeTextFileSync(
  join(import.meta.dirname!, "../schemas/config.json"),
  JSON.stringify(
    toJsonSchema(ConfigSchema, {
      typeMode: "input",
      definitions: { timeZone: TimeZoneSchema },
    }),
    null,
    2,
  ),
);
