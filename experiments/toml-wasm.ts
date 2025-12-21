// import console from "node:console";
// import wasmBytes from "./index_bg.wasm" with { type: "bytes" };
// import init, { initSync, edit, parse } from "npm:@rainbowatcher/toml-edit-js/index";

// async function testNormal() {
//   console.log("🧪 Testing NORMAL (Implicit) WASM Loading...");
  
//   // Let the library try to find the WASM itself
//   await init({wasmBytes});

//   const toml = `# Keep this comment\n[test]\nkey = "old" # And this one`;
//   const result = edit(toml, "test.key", "new");
  
//   console.log("Output:\n" + result);
//   console.log("Parse check:", parse(result).test.key === "new" ? "✅ PASS" : "❌ FAIL");
// }

// testNormal();

///////////////////////////////////////////////////////////////////////////////////////////////////

// Import from the LOCAL file we just copied, bypasses NPM export rules

import console from "node:console";
import wasmBytes from "./index_bg.wasm" with { type: "bytes" };
import { initSync, edit, parse } from "@rainbowatcher/toml-edit-js";

function testExplicit() {
  console.log("🧪 Testing EXPLICIT (Local Vendor) Loading...");
  
  try {
    // 1. Use the pattern suggested by the JSDoc
    // Some versions require { module: Uint8Array }
    // const module = new WebAssembly.Module(wasmBytes);
    // initSync({ module: module });
    initSync({module: wasmBytes});
    // initSync({ module: wasmBytes });
    
    console.log("✅ initSync called.");

    const tomlString = `[pkg]\nname = "test" # change me`;
    
    // 2. Use the namespace to ensure we call the initialized version
    const result = edit(tomlString, "pkg.name", "deno-bundle");
    
    console.log("Result:\n" + result);
    
    const parsed = parse(result);
    console.log("Parse Check:", parsed.pkg.name === "deno-bundle" ? "✅" : "❌");
    
  } catch (err) {
    console.error("❌ Initialization Error:");
    console.error(err);
  }
}

testExplicit();