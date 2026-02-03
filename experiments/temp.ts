import { parseDocument } from "@eemeli/yaml";

const doc = parseDocument(""); // Empty document

// Path: ['server', 'users', 0, 'name']
doc.setIn(["server", "users", 0, "name"], "Alice");

console.log(doc.toString());
