const SPACE_CACHE: string[] = [
  "",
  " ",
  "  ",
  "   ",
  "    ",
  "     ",
  "      ",
  "       ",
  "        ",
];

export function getSpaceCache(n: number): string {
  if (n <= 0) return "";
  if (SPACE_CACHE[n] !== undefined) return SPACE_CACHE[n];
  return (SPACE_CACHE[n] = " ".repeat(n));
}
