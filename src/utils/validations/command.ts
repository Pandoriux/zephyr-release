import type {
  CommandHookKind,
  CommandHookOutput,
} from "../../schemas/configs/modules/components/command-hook.ts";
import type { CommandOutput } from "../../schemas/configs/modules/components/command.ts";

export function isCommandHookValid<K extends CommandHookKind>(
  commandHook: CommandHookOutput | undefined,
  kind: K,
): commandHook is
  & CommandHookOutput
  & Record<K, CommandOutput[]> {
  const commands = commandHook?.[kind];
  if (!commands) return false;

  // Array: must have at least one valid command
  if (commands.length === 0) return false;

  // For arrays with multiple elements, find at least one valid command
  return commands.some((cmd) => Boolean(cmd.cmd));
}
