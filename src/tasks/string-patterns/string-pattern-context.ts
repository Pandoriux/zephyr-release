import { DateTimeFormatter, nativeJs, ZoneId } from "@js-joda/core";
import type { ConfigOutput } from "../../schemas/configs/config.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import type { BaseStringPatternContext } from "../../types/string-patterns.ts";
import { taskLogger } from "../logger.ts";

type GetBaseStrPatCtxConfigParams = Pick<ConfigOutput, "name" | "timeZone">;

export function getBaseStringPatternContext(
  provider: PlatformProvider,
  startTime: Date,
  { name, timeZone }: GetBaseStrPatCtxConfigParams,
): BaseStringPatternContext {
  const targetZoneId = ZoneId.of(timeZone);
  const zonedDateTime = nativeJs(startTime, targetZoneId);

  function zdtFormat(pattern: string) {
    return zonedDateTime.format(DateTimeFormatter.ofPattern(pattern));
  }

  const patternContext = {
    name: name ?? "",
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
  };
  taskLogger.debug(JSON.stringify(patternContext, null, 2));

  return patternContext;
}
