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
import { resolveStringTemplateOrThrow } from "./resolve-template.ts";
import type { PullRequestConfigOutput } from "../../schemas/configs/modules/pull-request-config.ts";

export const STRING_PATTERN_CONTEXT: Record<string, unknown> = {};

export function createCustomStringPatternContext(
  context: ConfigOutput["customStringPatterns"],
): void {
  Object.assign(STRING_PATTERN_CONTEXT, context);

  taskLogger.debug(
    "Custom string pattern context: " + JSON.stringify(context, null, 2),
  );
}

type CreateFixedStrPatCtxConfigParams =
  & Pick<ConfigOutput, "name" | "timeZone">
  & {
    pullRequest: Pick<PullRequestConfigOutput, "branchNameTemplate">;
  };

export async function createFixedBaseStringPatternContext(
  provider: PlatformProvider,
  triggerBranchName: string,
  config: CreateFixedStrPatCtxConfigParams,
): Promise<void> {
  const { name, timeZone, pullRequest: { branchNameTemplate } } = config;

  const targetZoneId = ZoneId.of(timeZone);
  const zonedDateTime = nativeJs(startTime, targetZoneId);

  function zdtFormat(pattern: string) {
    return zonedDateTime.format(DateTimeFormatter.ofPattern(pattern));
  }

  const context = {
    name: name,
    host: provider.getHost(),
    namespace: provider.getNamespace(),
    repository: provider.getRepositoryName(),
    commitPathPart: provider.getCommitPathPart(),
    referencePathPart: provider.getReferencePathPart(),

    triggerBranchName: triggerBranchName,

    timeZone: timeZone,
    timestamp: startTime.getTime(),
    "YYYY": zdtFormat("yyyy"),
    "MM": zdtFormat("MM"),
    "DD": zdtFormat("dd"),
    "HH": zdtFormat("HH"),
    "mm": zdtFormat("mm"),
    "ss": zdtFormat("ss"),
  } satisfies Omit<
    Record<FixedBaseStringPattern, string | number | undefined>,
    "workingBranchName"
  >;

  Object.assign(STRING_PATTERN_CONTEXT, context);

  const workingBranchContext = {
    workingBranchName: await resolveStringTemplateOrThrow(branchNameTemplate),
  } satisfies Pick<Record<FixedBaseStringPattern, string>, "workingBranchName">;

  Object.assign(STRING_PATTERN_CONTEXT, workingBranchContext);

  taskLogger.debug(
    "Fixed base string pattern context: " +
      JSON.stringify({ ...context, ...workingBranchContext }, null, 2),
  );
}

export async function createFixedVersionStringPatternContext(
  version: SemVer,
  tagTemplate: string,
) {
  const versionContext = {
    version: format(version),
    versionCore: `${version.major}.${version.minor}.${version.patch}`,
    versionPre: version.prerelease?.length
      ? version.prerelease.join(".")
      : undefined,
    versionBld: version.build?.length ? version.build.join(".") : undefined,
  } satisfies Omit<
    Record<FixedVersionStringPattern, string | undefined>,
    "tagName"
  >;

  Object.assign(STRING_PATTERN_CONTEXT, versionContext);

  const tagContext = {
    tagName: await resolveStringTemplateOrThrow(tagTemplate),
  } satisfies Pick<Record<FixedVersionStringPattern, string>, "tagName">;

  Object.assign(STRING_PATTERN_CONTEXT, tagContext);

  taskLogger.debug(
    "Fixed version string pattern context: " +
      JSON.stringify({ ...versionContext, ...tagContext }, null, 2),
  );
}
