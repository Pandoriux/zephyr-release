import { join } from "@std/path";
import denoJson from "../deno.json" with { type: "json" };

// Generate version.ts, mirroring deno.json { version }
Deno.writeTextFileSync(
  join(import.meta.dirname!, "../src/version.generated.ts"),
  `// This file is auto-generated during build. 
// No need to create or edit it manually.

/**
 * Run build once to generate this file.
 *
 * Mirrors deno.json { version }.
 */
export const VERSION = "${denoJson.version}";
`,
);
