import {
  type Commit,
  type CommitBase,
  CommitParser,
} from "conventional-commits-parser";
import { baseConventionalCommitParserOptions } from "../../src/constants/conventional-commit-parser-options.ts";
import { DEFAULT_COMMIT_TYPES } from "../../src/constants/defaults/commit.ts";

// Simplified version of ResolvedCommit type
type ResolvedCommit = CommitBase & {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  breaking?: string; // This is the "!" char
  isBreaking: boolean;
};

// Simplified version of the resolve function for a single commit
function resolveSingleCommit(
  commitMessage: string,
  commitHash: string = "abc123def456",
): ResolvedCommit {
  // Use the same parser options as the actual code
  const commitParser = new CommitParser(baseConventionalCommitParserOptions);

  // Parse the commit message
  const commit = commitParser.parse(commitMessage);

  const type = commit.type?.toLowerCase() || "";
  const subject = commit.subject || "";

  // Check for breaking changes
  const hasBreakingNote = commit.notes.some(
    (n) => n.title === "BREAKING CHANGE" || n.title === "BREAKING-CHANGE",
  );
  const isBreaking = !!commit.breaking || hasBreakingNote;

  // If breaking but no note, add one (matching the actual code behavior)
  if (isBreaking && !hasBreakingNote) {
    commit.notes.push({ title: "BREAKING CHANGE", text: subject });
  }

  // Build the resolved commit
  const resolvedCommit: ResolvedCommit = {
    ...commit,
    hash: commitHash,
    type,
    subject,
    isBreaking,
  };

  return resolvedCommit;
}

// Create a concise commit message covering all features
const comprehensiveCommitMessage =
  `feat(api)!: add new authentication endpoint (#800)

Implement OAuth2 authentication with JWT token support.

BREAKING CHANGE: The old /auth/login endpoint is deprecated. Use /auth/oauth2 instead.

Fixes #123
Closes #456
Refs #789

Co-authored-by: John Doe <john@example.com>`;

// Resolve the commit
const resolvedCommit = resolveSingleCommit(
  comprehensiveCommitMessage,
  "abc123def456",
);

// Create output object - this will be used as JSDoc example
const output = {
  parsedCommit: resolvedCommit,
};

// Write to file
const outputPath =
  "experiments/conventional-commit-changelog/resolved-commit-output.json";
await Deno.writeTextFile(
  outputPath,
  JSON.stringify(output, null, 2),
);

console.log(
  `✅ Successfully resolved commit and wrote output to: ${outputPath}`,
);
console.log(`\n📊 Summary:`);
console.log(`   - Type: ${resolvedCommit.type}`);
console.log(`   - Scope: ${resolvedCommit.scope || "none"}`);
console.log(`   - Subject: ${resolvedCommit.subject}`);
console.log(`   - Breaking: ${resolvedCommit.isBreaking}`);
console.log(`   - Hash: ${resolvedCommit.hash}`);
console.log(`   - References: ${resolvedCommit.references?.length || 0}`);
console.log(`   - Notes: ${resolvedCommit.notes?.length || 0}`);
console.log(`   - Mentions: ${resolvedCommit.mentions?.length || 0}`);
