import { toKebabCase } from "@std/text";
import { toConstantCase } from "@std/text/unstable-to-constant-case";

export function toExportOutputKey(k: string): string {
  return "zr-" + toKebabCase(k);
}

export function toExportEnvVarKey(k: string): string {
  return "ZR_" + toConstantCase(k);
}
