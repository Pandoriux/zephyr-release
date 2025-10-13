import { join } from "@std/path";
import denoJson from "../deno.json" with { type: "json" };

// Generate version.ts, mirroring deno.json { version }
Deno.writeTextFileSync(
  join(import.meta.dirname!, "../src/action-version.ts"),
  `// This file is auto-generated during build. 
// No need to create or edit it manually.

/**
 * Mirrors deno.json { version }.
 */
export const VERSION = "${denoJson.version}";
`,
);
