import type { ParserOptions } from "conventional-commits-parser";
import { baseConventionalCommitParserOptions } from "../../constants/conventional-commit-parser-options.ts";

export function githubGetConventionalCommitParserOptions(): ParserOptions {
  return {
    ...baseConventionalCommitParserOptions,

    issuePrefixes: [
      ...baseConventionalCommitParserOptions.issuePrefixes,
      "gh-",
    ],
  };
}
