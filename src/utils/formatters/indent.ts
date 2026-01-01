export function indentLines(str: string, indents: number = 2) {
  return str.split(/\r?\n/).map((line) => " ".repeat(indents) + line).join(
    "\n",
  );
}
