import { blue, cyan, gray, yellow } from "@std/fmt/colors";

function prefixLines(message: string, prefix: string): string {
  return message.split(/\r?\n/).map((line) => `${prefix}${line}`).join("\n");
}

interface HeaderOptions {
  totalWidth?: number;
  padChar?: string;
  uppercase?: boolean;
}

export function formatHeaderMessage(
  message: string,
  options?: HeaderOptions,
) {
  const { totalWidth = 60, padChar = "=", uppercase = true } = options ?? {};

  const rawText = uppercase ? message.toUpperCase().trim() : message.trim();

  // We need at least 2 spaces (left/right) and 2 pad chars (left/right) to look right
  const MIN_OVERHEAD = 4;
  const maxLineLength = totalWidth - MIN_OVERHEAD;

  const words = rawText.split(/\s+/);

  // 1. ABSOLUTE FALLBACK: If a single word is too long to fit on a padded line
  if (words.some((word) => word.length > maxLineLength)) {
    const fullPad = padChar.repeat(totalWidth).slice(0, totalWidth);
    return `${fullPad}\n${rawText}\n${fullPad}`;
  }

  // 2. WORD WRAPPING: Group words into lines that fit within maxLineLength
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxLineLength) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // 3. CENTERING: Format each line with dynamic padding
  const formattedLines = lines.map((line) => {
    const textToCenter = ` ${line} `;
    const paddingNeeded = totalWidth - textToCenter.length;

    const leftPadCount = Math.floor(paddingNeeded / 2);
    const rightPadCount = paddingNeeded - leftPadCount;

    const leftPad = padChar.repeat(leftPadCount).slice(0, leftPadCount);
    const rightPad = padChar.repeat(rightPadCount).slice(0, rightPadCount);

    return `${leftPad}${textToCenter}${rightPad}`;
  });

  return `\n${formattedLines.join("\n")}`;
}

type StepMessageKind = "start" | "finish" | "skip";

export function formatStepMessage(
  message: string,
  kind?: StepMessageKind,
): string {
  const arrow = blue("❯ ");
  const icon = kind === "start"
    ? "⏳"
    : kind === "finish"
    ? "✔"
    : kind === "skip"
    ? "↷"
    : undefined;

  const prefix = icon ? `${arrow}${icon} ` : arrow;
  return prefixLines(message, prefix);
}

export function formatDebugMessage(message: string): string {
  return gray(message);
}

export function formatDebugStepMessage(
  message: string,
  kind?: StepMessageKind,
): string {
  const arrow = gray("❯ ");
  const icon = kind === "start"
    ? "⏳"
    : kind === "finish"
    ? "✔"
    : kind === "skip"
    ? "↷"
    : undefined;

  const prefix = icon ? `${arrow}${gray(icon)} ` : arrow;
  return gray(prefixLines(message, prefix));
}

export function formatNoticeMessage(message: string): string {
  return cyan(message);
}

export function formatWarnMessage(message: string): string {
  return yellow(message);
}

export function formatIndentedMessage(message: string): string {
  return prefixLines(message, "  │ ");
}
