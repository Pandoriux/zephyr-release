import { format, type SemVer } from "@std/semver";
import { DateTimeFormatter, nativeJs, ZoneId } from "@js-joda/core";
import type { ConfigOutput } from "../../schemas/configs/config.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import { taskLogger } from "../logger.ts";
import { startTime } from "../../main.ts";
import type {
  DynamicChangelogStringPattern,
  FixedBaseStringPattern,
  FixedPreviousVersionStringPattern,
  FixedVersionStringPattern,
} from "../../constants/string-patterns.ts";
import { resolveStringTemplateOrThrow } from "./resolve-template.ts";
import type { ReviewConfigOutput } from "../../schemas/configs/modules/review-config.ts";
import { jsonValueNormalizer } from "../../utils/transformers/json.ts";

export const STRING_PATTERN_CONTEXT: Record<string, unknown> = {};

// new introduced
const BUILT_IN_CONTEXT: Record<string, unknown> = {};
const CUSTOM_CONTEXT: Record<string, unknown> = {};

export function createCustomStringPatternContext(
  context: ConfigOutput["customStringPatterns"],
): void {
  Object.assign(CUSTOM_CONTEXT, context);
  Object.assign(STRING_PATTERN_CONTEXT, CUSTOM_CONTEXT, BUILT_IN_CONTEXT);

  taskLogger.debug(
    "Custom string pattern context: " + JSON.stringify(CUSTOM_CONTEXT, null, 2),
  );
}

type CreateFixedStrPatCtxConfigParams =
  & Pick<ConfigOutput, "name" | "timeZone">
  & {
    review: Pick<ReviewConfigOutput, "workingBranchNameTemplate">;
  };

export async function createFixedBaseStringPatternContext(
  provider: PlatformProvider,
  triggerBranchName: string,
  config: CreateFixedStrPatCtxConfigParams,
): Promise<void> {
  const { name, timeZone } = config;
  const { workingBranchNameTemplate } = config.review;

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

  Object.assign(BUILT_IN_CONTEXT, context);
  Object.assign(STRING_PATTERN_CONTEXT, CUSTOM_CONTEXT, BUILT_IN_CONTEXT);

  const workingBranchContext = {
    workingBranchName: await resolveStringTemplateOrThrow(
      workingBranchNameTemplate,
    ),
  } satisfies Pick<Record<FixedBaseStringPattern, string>, "workingBranchName">;

  Object.assign(BUILT_IN_CONTEXT, workingBranchContext);
  Object.assign(STRING_PATTERN_CONTEXT, CUSTOM_CONTEXT, BUILT_IN_CONTEXT);

  taskLogger.debug(
    "Fixed base string pattern context: " +
      JSON.stringify({ ...context, ...workingBranchContext }, null, 2),
  );
}

export function createFixedPreviousVersionStringPatternContext(
  previousVersion?: SemVer,
) {
  if (!previousVersion) return;

  const versionContext = {
    previousVersion: format(previousVersion),
    previousVersionCore:
      `${previousVersion.major}.${previousVersion.minor}.${previousVersion.patch}`,
    previousVersionPre: previousVersion?.prerelease?.length
      ? previousVersion.prerelease.join(".")
      : undefined,
    previousVersionBld: previousVersion?.build?.length
      ? previousVersion.build.join(".")
      : undefined,
  } satisfies Record<FixedPreviousVersionStringPattern, string | undefined>;

  Object.assign(BUILT_IN_CONTEXT, versionContext);
  Object.assign(STRING_PATTERN_CONTEXT, CUSTOM_CONTEXT, BUILT_IN_CONTEXT);

  taskLogger.debug(
    "Fixed previous version string pattern context: " +
      JSON.stringify(versionContext, null, 2),
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

  Object.assign(BUILT_IN_CONTEXT, versionContext);
  Object.assign(STRING_PATTERN_CONTEXT, CUSTOM_CONTEXT, BUILT_IN_CONTEXT);

  const tagContext = {
    tagName: await resolveStringTemplateOrThrow(tagTemplate),
  } satisfies Pick<Record<FixedVersionStringPattern, string>, "tagName">;

  Object.assign(BUILT_IN_CONTEXT, tagContext);
  Object.assign(STRING_PATTERN_CONTEXT, CUSTOM_CONTEXT, BUILT_IN_CONTEXT);

  taskLogger.debug(
    "Fixed version string pattern context: " +
      JSON.stringify({ ...versionContext, ...tagContext }, null, 2),
  );
}

export function createDynamicChangelogStringPatternContext(
  changelogRelease?: string,
  changelogReleaseBody?: string,
) {
  const context = {
    changelogRelease,
    changelogReleaseBody,
  } satisfies Record<DynamicChangelogStringPattern, string | undefined>;

  Object.assign(BUILT_IN_CONTEXT, context);
  Object.assign(STRING_PATTERN_CONTEXT, CUSTOM_CONTEXT, BUILT_IN_CONTEXT);

  taskLogger.debug(
    "Dynamic changelog string pattern context: " +
      JSON.stringify(context, null, 2),
  );
}
