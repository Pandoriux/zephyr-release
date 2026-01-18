import { DateTimeFormatter, nativeJs, ZoneId } from "@js-joda/core";
import type { ConfigOutput } from "../../schemas/configs/config.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import { taskLogger } from "../logger.ts";
import { startTime } from "../../main.ts";
import type { FixedBaseStringPattern } from "../../constants/string-patterns.ts";

type ResolveStaticStrPatCtxConfigParams = Pick<
  ConfigOutput,
  "name" | "timeZone"
>;

/**
 * Fixed string pattern context object
 */
export const FIXED_STR_PAT_CTX: Readonly<
  Record<string, string | undefined>
> = {};

export function resolveFixedBaseStringPatternContext(
  provider: PlatformProvider,
  config: ResolveStaticStrPatCtxConfigParams,
): void {
  const { name, timeZone } = config;

  const targetZoneId = ZoneId.of(timeZone);
  const zonedDateTime = nativeJs(startTime, targetZoneId);

  function zdtFormat(pattern: string) {
    return zonedDateTime.format(DateTimeFormatter.ofPattern(pattern));
  }

  const context = {
    name: name,
    timeZone: timeZone,
    namespace: provider.getNamespace(),
    repository: provider.getRepositoryName(),
    "YYYY-MM-DD": zdtFormat("yyyy-MM-dd"),
    "DD-MM-YYYY": zdtFormat("dd-MM-yyyy"),
    "YYYY": zdtFormat("yyyy"),
    "MM": zdtFormat("MM"),
    "DD": zdtFormat("dd"),
    "HH:mm:ss": zdtFormat("HH:mm:ss"),
    "HH": zdtFormat("HH"),
    "mm": zdtFormat("mm"),
    "ss": zdtFormat("ss"),
  } satisfies Record<FixedBaseStringPattern, string | undefined>;

  Object.assign(FIXED_STR_PAT_CTX, context);

  taskLogger.debug(JSON.stringify(FIXED_STR_PAT_CTX, null, 2));
}
