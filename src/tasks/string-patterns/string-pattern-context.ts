import { format, type SemVer } from "@std/semver";
import { DateTimeFormatter, nativeJs, ZoneId } from "@js-joda/core";
import type { ConfigOutput } from "../../schemas/configs/config.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import { taskLogger } from "../logger.ts";
import { startTime } from "../../main.ts";
import type {
  FixedBaseStringPattern,
  FixedVersionStringPattern,
} from "../../constants/string-patterns.ts";
import { resolveStringTemplate } from "./resolve-string-template.ts";

/**
 * Fixed string pattern context object
 */
export const FIXED_STR_PAT_CTX: Readonly<
  Record<string, string | undefined>
> = {};

type CreateFixedStrPatCtxConfigParams = Pick<
  ConfigOutput,
  "name" | "timeZone"
>;

export function createFixedBaseStringPatternContext(
  provider: PlatformProvider,
  config: CreateFixedStrPatCtxConfigParams,
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

  taskLogger.debug(
    "Fixed base string pattern context: " +
      JSON.stringify(FIXED_STR_PAT_CTX, null, 2),
  );
}

export function createFixedVersionStringPatternContext(
  version: SemVer,
  tagTemplate: string,
) {
  const context = {
    version: format(version),
    versionCore: `${version.major}.${version.minor}.${version.patch}`,
    versionPre: version.prerelease?.length
      ? version.prerelease.join(".")
      : undefined,
    versionBld: version.build?.length ? version.build.join(".") : undefined,

    tagName: resolveStringTemplate(tagTemplate),
  } satisfies Record<FixedVersionStringPattern, string | undefined>;

  Object.assign(FIXED_STR_PAT_CTX, context);

  taskLogger.debug(
    "Fixed version string pattern context: " +
      JSON.stringify(FIXED_STR_PAT_CTX, null, 2),
  );
}
