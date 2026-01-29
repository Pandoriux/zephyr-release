import { type CommitBase, CommitParser } from "conventional-commits-parser";
import { filterRevertedCommitsSync } from "conventional-commits-filter";
import type { ProviderCommit } from "../../src/types/providers/commit.ts";
import { DEFAULT_COMMIT_TYPES } from "../../src/constants/defaults/commit.ts";
import { createGitHubProvider } from "../../src/providers/github/github-provider.ts";

type ResolvedCommit = CommitBase & {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  breaking?: string; // This is the "!" char
  isBreaking: boolean;
};

// Mock raw commits for testing
const mockRawCommits: ProviderCommit[] = [
  {
    hash: "abc123",
    header: "feat: add new feature",
    body: "This is a new feature description",
    message: `feat: add new feature
    
    This is a new feature description
    
    Close #3
    release-as: v10`,
  },
  {
    hash: "def456",
    header: "fix: resolve bug in parser",
    body: "Fixed an issue with commit parsing",
    message: "fix: resolve bug in parser\n\nFixed an issue with commit parsing",
  },
  {
    hash: "ghi789",
    header: "feat!: breaking change",
    body: "This is a breaking change",
    message: "feat!: breaking change\n\nThis is a breaking change",
  },
  {
    hash: "jkl012",
    header: "feat(scope): add scoped feature",
    body: "Added a feature with scope",
    message: "feat(scope): add scoped feature\n\nAdded a feature with scope",
  },
  {
    hash: "mno345",
    header: "perf: improve performance",
    body: "Optimized some code",
    message: "perf: improve performance\n\nOptimized some code",
  },
  {
    hash: "pqr678",
    header: "docs: update documentation",
    body: "Updated README",
    message: "docs: update documentation\n\nUpdated README",
  },
  {
    hash: "stu901",
    header: "feat: add feature with breaking note",
    body: "BREAKING CHANGE: This changes the API",
    message:
      "feat: add feature with breaking note\n\nBREAKING CHANGE: This changes the API",
  },
  {
    hash: "vwx234",
    header: "revert: revert previous commit",
    body: "Reverts abc123",
    message: "revert: revert previous commit\n\nReverts abc123",
  },
];

const provider = createGitHubProvider();
const commitTypes = DEFAULT_COMMIT_TYPES;

const rawCommits = mockRawCommits;

// Options is shallow merged with the library defaults
const commitParser = new CommitParser(
  provider.getConventionalCommitParserOptions(),
);

const allowedTypes = new Set(commitTypes.map((c) => c.type));
const parsedFilteredCommits: ResolvedCommit[] = [];

for (const raw of rawCommits) {
  const commit = commitParser.parse(raw.message);

  const type = commit.type?.toLowerCase();
  const subject = commit.subject;

  if (!type || !subject || !allowedTypes.has(type)) continue;

  const hasBreakingNote = commit.notes.some(
    (n) => n.title === "BREAKING CHANGE" || n.title === "BREAKING-CHANGE",
  );
  const isBreaking = !!commit.breaking || !!hasBreakingNote;

  if (isBreaking && !hasBreakingNote) {
    commit.notes.push({
      title: "BREAKING CHANGE",
      text: subject,
    });
  }

  parsedFilteredCommits.push({
    ...commit,
    hash: raw.hash,
    type,
    subject,
    isBreaking,
  });
}

const resolvedCommits = Array.from(
  filterRevertedCommitsSync(parsedFilteredCommits),
);

console.log("Resolved (parsed and filtered) commits:");
console.log(JSON.stringify(resolvedCommits, null, 2));

console.log(`\nTotal resolved commits: ${resolvedCommits.length}`);
