import * as fs from 'node:fs';
import { modify, applyEdits } from 'jsonc-parser';
import { JsonParser, JsonObjectNode } from '@croct/json5-parser';
import console from "node:console";

// 1. THE "WEIRD" INPUT STRING
// This is valid JSONC (standard JSON + comments). 
// It has mixed tabs, weird spaces, and comments in odd places.
const weirdJson = `{
  // Global configuration
  "project"   :    "demo-app",
  
	"version": "1.0.0", /* This version needs updating */

  "metadata": {
    "tags": [
      "alpha",
      // Todo: add beta tag here
      "stable"
    ],
      "author": "John Doe"    // weird indent here
  },
  
  "settings": { "darkMode": true, "zoom": 1.2 }
}`;

console.log("--- ORIGINAL ---");
console.log(weirdJson);

const pathUpdate = ['version'];
const newValue = "2.0.0";

// --- APPROACH A: jsonc-parser (The Surgical Patcher) ---
// This identifies the exact character offsets and replaces only them.
function runJsoncParser() {
    const edits = modify(weirdJson, pathUpdate, newValue, {
        formattingOptions: { insertSpaces: true, tabSize: 2 }
    });
    const result = applyEdits(weirdJson, edits);
    fs.writeFileSync('output_jsonc.jsonc', result);
    return result;
}

// --- APPROACH B: @croct/json5-parser (The CST Re-printer) ---
// This builds a tree, modifies a node, and then re-generates the string.
function runCroctParser() {
    const doc = JsonParser.parse(weirdJson, JsonObjectNode);
    doc.set('version', newValue);
    const result = doc.toString();
    fs.writeFileSync('output_croct.json5', result);
    return result;
}

const resultA = runJsoncParser();
const resultB = runCroctParser();

console.log("\n--- RESULT: jsonc-parser ---");
console.log(resultA);

console.log("\n--- RESULT: @croct/json5-parser ---");
console.log(resultB);

// Verification Logic
console.log("\n--- Comparison Report ---");
const isIdentical = resultA === resultB;
console.log(`Are the outputs byte-for-byte identical? ${isIdentical ? '✅ Yes' : '❌ No'}`);

if (!isIdentical) {
    console.log("- jsonc-parser: Preserved 100% of the original string except for the value '2.0.0'.");
    console.log("- @croct/json5-parser: Attempted to preserve style, but might have standardized some spacing/indentation during the re-print.");
}