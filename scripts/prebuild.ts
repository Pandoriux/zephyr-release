import { dirname, join } from "@std/path";

// Ensure `deno install` has run before building
await new Deno.Command(Deno.execPath(), {
  cwd: join(import.meta.dirname!, ".."),
  args: ["install"],
  stdout: "inherit",
  stderr: "inherit",
}).output();

// Delete old directories and files before building
const itemPathsToDelete = [
  join(import.meta.dirname!, "../dist"),
  join(import.meta.dirname!, `../src/vendors`),
];

for (const itemPath of itemPathsToDelete) {
  try {
    Deno.removeSync(itemPath, { recursive: true });
  } catch { /* ignore */ }
}

// Prepare required build artifacts/vendor assets into the source tree for local loading
// @rainbowatcher/toml-edit-js/index_bg.wasm
const rTomlEditJsToPath = join(
  import.meta.dirname!,
  "../src/vendors/@rainbowatcher-toml-edit-js/index_bg.wasm",
);

Deno.mkdirSync(dirname(rTomlEditJsToPath), { recursive: true });
Deno.copyFileSync(
  join(
    import.meta.dirname!,
    "../node_modules/@rainbowatcher/toml-edit-js/index_bg.wasm",
  ),
  rTomlEditJsToPath,
);
