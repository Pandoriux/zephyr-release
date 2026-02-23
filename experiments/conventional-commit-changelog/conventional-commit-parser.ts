import { CommitParser, type ParserOptions } from "conventional-commits-parser";

// 1. Our Test Commits
const commitMsgs = [
  // 4. Breaking change WITHOUT a scope (Tests the '!' capture group alone)
  "feat!: drop support for internet explorer (# 200)",

  // 5. Multiple Footers (Tests issue reference parsing + BREAKING CHANGE)
  `fix(security): resolve buffer overflow

This was caused by unsanitized input in the buffer stream.

Fixes #123
Refs #456
BREAKING CHANGE: The 'buffer' utility is now private.`,

  // 6. Standard Revert (Tests your 'revertPattern' and 'revertCorrespondence')
  `revert: "feat(ui): add button"

This reverts commit a1b2c3d4e5f6g7h8.`,

  // 8. Complex Scope (Tests characters like dashes or dots in the scope)
  "refactor(api-v1.core): streamline auth flow",
  // `Revert "feat(ui): add button" This reverts commit a1b2c3d4e5f6g7h8.`,
];

// 2. The Default Options (as found in source)

// 3. The GitHub/Modern Optimized Options
const githubOptions: ParserOptions = {
  // Updated regex to capture the '!' in group 3
  headerPattern: /^(\w*)(?:\(([\w$@.\-*/ ]*)\))?(!?): (.*)$/,
  // Added 'breaking' to map that '!' group
  headerCorrespondence: ["type", "scope", "breaking", "subject"],
  revertPattern:
    /^(?:Revert|revert:?)\s+"?([\s\S]*?)"?\s*This reverts commit (\w+)/,
  revertCorrespondence: ["header", "hash"],
};

// 4. Initialize Parsers
const defaultParser = new CommitParser();
const githubParser = new CommitParser(githubOptions);

// 5. Run Comparison
const defaultResults = commitMsgs.map((msg) => defaultParser.parse(msg));
const githubResults = commitMsgs.map((msg) => githubParser.parse(msg));
// const officialResult = commitMsgs.map((msg) =>
//   toConventionalChangelogFormat(parser(msg))
// );

// --- Output Results ---

console.log("=== DEFAULT PARSER RESULTS ===");
defaultResults.forEach((c, i) => {
  console.log(`Commit ${i + 1}:`, JSON.stringify(c, null, 2));
});

// console.log("\n=== GITHUB OPTIMIZED RESULTS ===");
// githubResults.forEach((c, i) => {
//   console.log(`Commit ${i + 1}:`, JSON.stringify(c, null, 2));
// });

// console.log("\n=== OFFICIAL RESULTS ===");
// officialResult.forEach((c, i) => {
//   console.log(`Commit ${i + 1}:`, JSON.stringify(c, null, 2));
// });
