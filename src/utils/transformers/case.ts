import { toKebabCase } from "@std/text";
import { toConstantCase } from "@std/text/unstable-to-constant-case";

export function toExportVariableKey(k: string): string {
  return "zr-" + toKebabCase(k);
}

export function toExportEnvVariableKey(k: string): string {
  return "ZR_" + toConstantCase(k);
}
