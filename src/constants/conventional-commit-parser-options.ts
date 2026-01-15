import type { ParserOptions } from "conventional-commits-parser";

/**
 * Builds on the library's default settings with support for modern features.
 *
 * See: https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-commits-parser/src/options.ts
 *
 * * Note: The "conventional-commits-parser" uses a shallow merge. This means
 * we only need to define the properties we want to change or add.
 */
export const baseConventionalCommitParserOptions = {
  /**
   * Default Options from "conventional-commits-parser". For reference only.
   */
  // noteKeywords: ["BREAKING CHANGE", "BREAKING-CHANGE"],
  // issuePrefixes: ["#"],
  // referenceActions: [
  //   "close",
  //   "closes",
  //   "closed",
  //   "fix",
  //   "fixes",
  //   "fixed",
  //   "resolve",
  //   "resolves",
  //   "resolved",
  // ],
  // headerPattern: /^(\w*)(?:\(([\w$@.\-*/ ]*)\))?: (.*)$/,
  // headerCorrespondence: [
  //   "type",
  //   "scope",
  //   "subject",
  // ],
  // revertPattern: /^Revert\s"([\s\S]*)"\s*This reverts commit (\w*)\./,
  // revertCorrespondence: ["header", "hash"],
  // fieldPattern: /^-(.*?)-$/,

  // =======================================================================

  // --- Modern Header Support ---
  // This pattern supports the "!" for breaking changes: feat(api)!: subject
  headerPattern: /^(\w*)(?:\(([\w$@.\-*/ ]*)\))?(!?): (.*)$/,
  headerCorrespondence: ["type", "scope", "breaking", "subject"],

  // --- Flexible Revert Support ---
  // Matches the standard Git format used by most CLI and web tools, with or without a colon
  revertPattern:
    /^(?:Revert|revert:?)\s+"?([\s\S]*?)"?\s*This reverts commit (\w+)/,
  revertCorrespondence: ["header", "hash"],

  noteKeywords: [
    "BREAKING CHANGE",
    "BREAKING-CHANGE",
    "release as",
    "release-as",
  ],

  issuePrefixes: ["#"],
  referenceActions: [
    "close",
    "closes",
    "closed",
    "fix",
    "fixes",
    "fixed",
    "resolve",
    "resolves",
    "resolved",
  ],
} satisfies ParserOptions;
