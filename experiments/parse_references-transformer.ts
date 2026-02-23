interface Reference {
  prefix: string;
  issue: string;
}

interface Commit {
  references: Reference[];
}

// Scaffolded mock provider
const mockProvider = {
  getReferenceUrl(referenceString: string): string {
    // Generates a fake URL based on the reference string
    return `https://tracker.example.com/ticket/${referenceString}`;
  },
};

// Isolated function logic
function parseReferences(txt: string, commit: Commit): string {
  const { references } = commit;
  if (references.length === 0) return txt;

  const referenceMap = new Map<string, string>();
  const uniqueRefs: string[] = [];

  for (const ref of references) {
    const referenceString = ref.prefix + ref.issue;

    if (!referenceMap.has(referenceString) && txt.includes(referenceString)) {
      const url = mockProvider.getReferenceUrl(referenceString);
      referenceMap.set(referenceString, `[${referenceString}](${url})`);
      uniqueRefs.push(referenceString);
    }
  }

  if (uniqueRefs.length === 0) return txt;

  // Sort by length descending to fix the "ISSUE-1 vs ISSUE-12" overlap bug
  uniqueRefs.sort((a, b) => b.length - a.length);

  // Escape regex characters (e.g., the "#" prefix)
  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pattern = new RegExp(uniqueRefs.map(escapeRegExp).join("|"), "g");

  return txt.replace(pattern, (match) => {
    const replacement = referenceMap.get(match);
    // Strict TS check to ensure replacement exists
    return replacement !== undefined ? replacement : match;
  });
}

// ==========================================
// TEST EXECUTION
// ==========================================

const mockCommit: Commit = {
  references: [
    { prefix: "ISSUE-", issue: "1" },
    { prefix: "ISSUE-", issue: "12" },
    { prefix: "#", issue: "99" },
  ],
};

const testStrings: string[] = [
  "Fixed ISSUE-12.", // Tests overlap bug (should not output [ISSUE-1](...)2.)
  "Fixed ISSUE-1 and ISSUE-12.", // Tests both side-by-side
  "Closes #99! It was a tricky bug (related to ISSUE-1).", // Tests punctuation and brackets
  "Regular text with no matches.", // Tests unmodified return
];

console.log("Starting reference parsing tests...\n");

for (const testStr of testStrings) {
  console.log(`Original: ${testStr}`);
  console.log(`Parsed:   ${parseReferences(testStr, mockCommit)}\n`);
}
