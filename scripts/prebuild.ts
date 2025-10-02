import { join } from "@std/path";

// Ensure `deno install` has run before building
await new Deno.Command(Deno.execPath(), {
  cwd: join(import.meta.dirname!, ".."),
  args: ["install"],
  stdout: "inherit",
  stderr: "inherit",
}).output();

// Delete old dist directory before building
try {
  Deno.removeSync(join(import.meta.dirname!, "../dist"), { recursive: true });
} catch {
  // ignore
}
