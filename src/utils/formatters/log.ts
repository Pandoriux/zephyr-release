import { blue, yellow } from "@std/fmt/colors";

function prefixLines(message: string, prefix: string): string {
  return message.split(/\r?\n/).map((line) => `${prefix}${line}`).join("\n");
}

export function formatDebugMessage(message: string): string {
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
  const arrow = yellow("❯ ");
  const icon = kind === "start"
    ? "⏳"
    : kind === "finish"
    ? "✔"
    : kind === "skip"
    ? "↷"
    : undefined;

  const prefix = icon ? `${arrow}${yellow(icon)} ` : arrow;
  return yellow(prefixLines(message, prefix));
}