import { blue, cyan, gray, yellow } from "@std/fmt/colors";

function prefixLines(message: string, prefix: string): string {
  return message.split(/\r?\n/).map((line) => `${prefix}${line}`).join("\n");
}

export function formatDebugMessage(message: string): string {
  return gray(message);
}

export function formatNoticeMessage(message: string): string {
  return cyan(message);
}

export function formatWarnMessage(message: string): string {
  return yellow(message);
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

export function formatIndentedMessage(message: string): string {
  return prefixLines(message, "  │ ");
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