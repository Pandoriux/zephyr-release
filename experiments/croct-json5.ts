import { JsonObjectNode, JsonParser } from "@croct/json5-parser";

const json5Source = `{
  // Project settings
  version: '1.0.0',
  settings: {
    theme: 'dark'
  }
}`;

const json5Source2 = `{
  // Project settings
settings: {}
}`;

// 1. Parse the source into a CST
const root = JsonParser.parse(json5Source2, JsonObjectNode);

console.log("--- Original JSON ---");
console.log(root.toString());

// 2. Edit a value at the root ('version')
// We use the shorthand here since the library converts primitives automatically
root.set("version", "2.0.0");

// 3. Edit a nested value ('settings.theme')
// Level 1: Get the 'settings' node
const settings = root.get("settings") as JsonObjectNode;

// Level 2: Set the 'theme' on that node
settings.set("theme", "light");

// 4. Log the final output
console.log("\n--- Updated JSON ---");
console.log(root.toString());
