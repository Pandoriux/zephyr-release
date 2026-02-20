import { canParse, parse, type SemVer } from "@std/semver";
import { taskLogger } from "../logger.ts";
import type { ConfigOutput } from "../../schemas/configs/config.ts";
import type { VersionFileOutput } from "../../schemas/configs/modules/components/version-file.ts";
import type { InputsOutput } from "../../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";
import { getTextFileOrThrow } from "../file.ts";
import {
  parseVersionFileOrThrow,
  resolveStructuredVersionFileFormatOrThrow,
} from "./vf-parser.ts";
import {
  detectVersionFileExtractor,
  extractVersionStringOrThrow,
} from "./vf-extractor.ts";
import { updateVersionInStructuredFile } from "./vf-transformer.ts";
import { parseRegExpFromSelector } from "../../utils/parsers/regex.ts";

export function getPrimaryVersionFile(
  versionFiles: ConfigOutput["versionFiles"],
): VersionFileOutput {
  const primaryFile = versionFiles.find((vf) => vf.primary) ?? versionFiles[0];

  if (!primaryFile) {
    throw new Error("Critical Error: Cannot find primary version file");
  }

  taskLogger.info(
    "Found current primary version file: " +
      JSON.stringify(primaryFile, null, 2),
  );

  return primaryFile;
}

export async function getVersionSemVerFromVersionFile(
  versionFile: VersionFileOutput,
  sourceMode: InputsOutput["sourceMode"],
  provider: PlatformProvider,
  workspacePath: string,
  triggerCommitHash: string,
): Promise<SemVer | undefined> {
  const fileContent = await getTextFileOrThrow(
    sourceMode.overrides?.[versionFile.path] ?? sourceMode.mode,
    versionFile.path,
    { workspacePath: workspacePath, provider, ref: triggerCommitHash },
  );

  const parsedResult = parseVersionFileOrThrow(
    fileContent,
    versionFile.format,
    versionFile.path,
  );
  taskLogger.info(
    `Version file parsed successfully (${parsedResult.resolvedFormatResult})`,
  );

  const extractor = versionFile.extractor === "auto"
    ? detectVersionFileExtractor(versionFile.selector)
    : versionFile.extractor;
  if (!extractor) {
    throw new Error(
      `Unable to determine a version file extractor for selector '${versionFile.selector}'`,
    );
  }

  const versionString = extractVersionStringOrThrow(
    parsedResult.parsedContent,
    extractor,
    versionFile.selector,
  );

  if (!versionString || !canParse(versionString)) {
    return undefined;
  }

  return parse(versionString);
}

export async function prepareVersionFilesToCommit(
  provider: PlatformProvider,
  versionFiles: ConfigOutput["versionFiles"],
  sourceMode: InputsOutput["sourceMode"],
  workspacePath: string,
  nextVersion: string,
  triggerCommitHash: string,
): Promise<[string, string][]> {
  const vfChangesData: [string, string][] = [];

  for (const vf of versionFiles) {
    const fileContent = await getTextFileOrThrow(
      sourceMode.overrides?.[vf.path] ?? sourceMode.mode,
      vf.path,
      {
        provider,
        workspacePath: workspacePath,
        ref: triggerCommitHash,
      },
    );

    const extractor = vf.extractor === "auto"
      ? detectVersionFileExtractor(vf.selector)
      : vf.extractor;

    if (!extractor) {
      throw new Error(
        `Unable to determine extractor for version file '${vf.path}' (selector: ${vf.selector})`,
      );
    }

    switch (extractor) {
      case "json-path": {
        const resolvedFormat = resolveStructuredVersionFileFormatOrThrow(
          fileContent,
          vf.path,
          vf.format,
        );

        const newContent = updateVersionInStructuredFile(
          fileContent,
          resolvedFormat,
          vf.selector,
          nextVersion,
        );

        vfChangesData.push([vf.path, newContent]);
        break;
      }

      case "regex": {
        const regex = parseRegExpFromSelector(vf.selector);

        const newContent = fileContent.replace(regex, (match, ...groups) => {
          const firstGroup = groups[0];
          if (firstGroup !== undefined) {
            return match.replace(firstGroup, nextVersion);
          }

          return nextVersion;
        });

        vfChangesData.push([vf.path, newContent]);
        break;
      }
    }
  }

  return vfChangesData;
}
