import { join } from "@std/path";

// Variables
const rainbowatcherTomlEditJsWasmToPath =
  "src/libs/toml-edit-js-wrapper/index_bg.wasm";

// Ensure `deno install` has run before building
await new Deno.Command(Deno.execPath(), {
  cwd: join(import.meta.dirname!, ".."),
  args: ["install"],
  stdout: "inherit",
  stderr: "inherit",
}).output();

// Delete old dist directory and build artifacts/vendor assets before building
const itemPathsToDelete = [
  join(import.meta.dirname!, "../dist"),
  join(import.meta.dirname!, `../${rainbowatcherTomlEditJsWasmToPath}`),
];

for (let i = 0; i < itemPathsToDelete.length; i++) {
  try {
    Deno.removeSync(itemPathsToDelete[i], { recursive: true });
  } catch { /* ignore */ }
}

// Prepare required build artifacts/vendor assets into the source tree for local loading
// @rainbowatcher/toml-edit-js/index_bg.wasm
Deno.copyFileSync(
  join(
    import.meta.dirname!,
    "../node_modules/@rainbowatcher/toml-edit-js/index_bg.wasm",
  ),
  join(
    import.meta.dirname!,
    `../${rainbowatcherTomlEditJsWasmToPath}`,
  ),
);
