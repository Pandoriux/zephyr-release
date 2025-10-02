import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/main.ts",
  outDir: "dist",
  format: "esm",
  fixedExtension: true,

  platform: "node",
  target: "node20.19",
});
