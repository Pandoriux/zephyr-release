import console from "node:console";

const json = `
{
  "Name": "Alice",
  "AGE": 25,
  "Address": {
    "City": "NYC",
    "Zip": "10001"
  },
  "Hobbies": [
    { "Type": "Sport", "Name": "Tennis" },
    { "Type": "Music", "Name": "Piano" }
  ]
}
`;

// Reviver function that logs key/value
function reviver(key: string, value: unknown) {
  console.log(`reviver called with key="${key}" value=`, value);
  return value; // return unmodified
}

function reviverUpper(_key: string, value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k.toUpperCase(), v]),
    );
  }

  return value;
}

const parsed = JSON.parse(json, reviverUpper);

console.log("\nFinal parsed object:");
console.log(parsed);
