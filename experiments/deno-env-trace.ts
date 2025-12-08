import console from "node:console";

// trace.ts
const originalGet = Deno.env.get;

// Overwrite the getter to log the request first
Deno.env.get = (key) => {
  console.log(`[DENO TRACE] Package requested env var: "${key}"`);
  return originalGet(key);
};

// Also trap "toObject" which triggers a full read
const originalToObject = Deno.env.toObject;
Deno.env.toObject = () => {
  console.log(`[DENO TRACE] 🚨 Package requested ALL environment variables!`);
  return originalToObject();
};

console.log("[Trace] EnvironmentInterceptor active.");