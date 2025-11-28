export function indentLines(str: string, indents: number = 2) {
  return str.split("\n").map((line) => " ".repeat(indents) + line).join("\n");
}
