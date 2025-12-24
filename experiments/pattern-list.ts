// Pattern tokens — just for reference and consistency
export const PATTERN_KEYS = {
  NAME: "name",
  VERSION: "version",
  CHANGELOG: "changelog",
  DATE: "YYYY-MM-DD",
  TIME: "hh:mm:ss",
} as const;

export type PatternKey = (typeof PATTERN_KEYS)[keyof typeof PATTERN_KEYS];

/** Resolves pattern placeholders in a template string using context data. */
export function resolvePattern(
  template: string,
  context: Record<string, string>,
): string {
  return template.replace(/\$\{([^}]+)\}/g, (_, key) => {
    // Trim just in case and support nested or unexpected spacing
    const cleanKey = key.trim();

    // Look up the value
    const value = context[cleanKey];

    // Return the value or leave it blank (or you could keep the original token)
    return value ?? "";
  });
}

export function buildPatternContext() {
  const now = new Date();

  // format helpers
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    name: "demo-project",
    version: "1.2.3",
    changelog: "- Added feature X\n- Fixed bug Y",
    "YYYY-MM-DD": now.toISOString().slice(0, 10),
    "hh:mm:ss": `${pad(now.getHours())}:${pad(now.getMinutes())}:${
      pad(now.getSeconds())
    }`,
  };
}

// Mock data
const context = buildPatternContext();

// Template examples
const prTitle = "Release ${name} v${version}";
const prBody = `
### What's new
${changelog}

Built at ${YYYY-MM-DD} ${hh:mm:ss}
`;

// Resolve
const resolvedTitle = resolvePattern(prTitle, context);
const resolvedBody = resolvePattern(prBody, context);

// Output
console.log("Title:\n", resolvedTitle);
console.log("\nBody:\n", resolvedBody);
