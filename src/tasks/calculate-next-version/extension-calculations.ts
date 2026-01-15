import type { SemVer } from "@std/semver";
import type { BumpStrategyConfigOutput } from "../../schemas/configs/modules/bump-strategy-config.ts";
import { startTime } from "../../main.ts";
import type { SemverExtensionsOutput } from "../../schemas/configs/modules/components/semver-extensions.ts";
import { SemverExtensionTypes } from "../../constants/semver-extension-options.ts";

export function calculateNextExtensionsSemVer(
  currentVer: SemVer,
  nextCoreVer: SemVer,
  strategy: BumpStrategyConfigOutput,
  baseTimeZone: string,
): SemVer {
  const extensionSemVer = { ...currentVer };

  // Determine if Core Version changed (to trigger "reset-on")
  const coreChanged = nextCoreVer.major !== currentVer.major ||
    nextCoreVer.minor !== currentVer.minor ||
    nextCoreVer.patch !== currentVer.patch;

  // 1. Prerelease
  if (!strategy.prerelease.enabled) {
    extensionSemVer.prerelease = [];
  } else {
    extensionSemVer.prerelease = resolveExtensionList(
      currentVer.prerelease ?? [],
      strategy.prerelease.override,
      strategy.prerelease.identifiers,
      coreChanged,
      baseTimeZone,
    );
  }

  // 2. Build
  if (!strategy.build.enabled) {
    extensionSemVer.build = [];
  } else {
    extensionSemVer.build = resolveExtensionList(
      currentVer.build ?? [],
      strategy.build.override,
      strategy.build.metadata,
      coreChanged,
      baseTimeZone,
    );
  }

  return extensionSemVer;
}

function resolveExtensionList(
  currentValues: (string | number)[],
  override: (string | number)[] | undefined,
  extensionItems: SemverExtensionsOutput[] | undefined,
  coreChanged: boolean,
  timeZone: string,
): string[] {
  // 1. Check Override
  if (override && override.length > 0) {
    return override.map(String);
  }

  // 2. If no schema items defined, return empty array
  if (!extensionItems || extensionItems.length === 0) {
    return [];
  }

  // 3. Resolve Items
  const resolvedExtItems: (string | number)[] = [];
  let structureChanged = false;

  extensionItems.forEach((item, index) => {
    const previousValue = currentValues[index];

    // Structural Change Detection
    if (!structureChanged) {
      if (previousValue === undefined) {
        structureChanged = true;
      } else if (item.type === "static") {
        if (String(previousValue) !== item.value) {
          structureChanged = true;
        }
      } else if (item.type === "incremental") {
        // Loose check: is it a number, or a string that looks like a number?
        const isNumber = typeof previousValue === "number";
        const isStringNumber = typeof previousValue === "string" &&
          !isNaN(Number(previousValue)) && previousValue.trim() !== "";

        if (!isNumber && !isStringNumber) {
          structureChanged = true;
        }
      }
      // dynamic/date/timestamp are assumed continuous if present
    }

    const resolvedValue = resolveExtensionItem(
      item,
      previousValue,
      coreChanged,
      structureChanged,
      timeZone,
    );

    if (resolvedValue !== null && resolvedValue !== undefined) {
      resolvedExtItems.push(resolvedValue);
    }
  });

  return resolvedExtItems;
}

function resolveExtensionItem(
  item: SemverExtensionsOutput,
  previousValue: string | number | undefined,
  coreChanged: boolean,
  structureChanged: boolean,
  timeZone: string,
): string | number {
  switch (item.type) {
    case "static":
      return item.value;

    case "dynamic":
      return item.value ?? item.fallbackValue ?? "";

    case "date": {
      const targetZoneId = ZoneId.of(item.timeZone ?? timeZone);
      const zonedDateTime = nativeJs(startTime, targetZoneId);
      const pattern =
        item.format === SemverExtensionDateFormatTypes["YYYY-MM-DD"]
          ? "yyyy-MM-dd"
          : "yyyyMMdd";
      return zonedDateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    case "timestamp": {
      const timeMs = startTime.getTime();
      if (item.unit === SemverExtensionTimestampUnitTypes.s) {
        return Math.floor(timeMs / 1000);
      }
      return timeMs;
    }

    case "incremental":
      return resolveIncremental(
        item,
        previousValue,
        coreChanged,
        structureChanged,
      );

    default:
      return 0;
  }
}

function resolveIncremental(
  item: Extract<SemverExtensionsSchemaType, { type: "incremental" }>,
  previousValue: string | number | undefined,
  coreChanged: boolean,
  structureChanged: boolean,
): number {
  const parser = new Parser();
  const startValue = item.initialValue ?? 0;

  // 1. Check for Reset
  let shouldReset = false;

  // A. Structural Change
  if (structureChanged) {
    shouldReset = true;
  }

  // B. Core Version Change
  if (!shouldReset && coreChanged) {
    const resetOn = Array.isArray(item.resetOn)
      ? item.resetOn
      : [item.resetOn ?? SemverExtensionResetOnOptions.none];

    if (
      resetOn.includes(SemverExtensionResetOnOptions.major) ||
      resetOn.includes(SemverExtensionResetOnOptions.minor) ||
      resetOn.includes(SemverExtensionResetOnOptions.patch)
    ) {
      shouldReset = true;
    }
  }

  // 2. Reset or Increment
  if (shouldReset) {
    return startValue;
  }

  // Handle "string number" from previous build metadata safely
  let v = startValue;
  if (typeof previousValue === "number") {
    v = previousValue;
  } else if (typeof previousValue === "string") {
    const parsed = Number(previousValue);
    if (!isNaN(parsed)) {
      v = parsed;
    }
  }

  // 3. Evaluate Expression
  const expr = item.nextValueExpression ?? "v+1";

  try {
    const result = parser.evaluate(expr, {
      v,
      ...item.expressionVariables,
    });
    return Math.floor(Number(result));
  } catch (_e) {
    return startValue;
  }
}
