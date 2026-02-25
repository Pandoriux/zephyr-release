import fsPromises from "node:fs/promises";
import fs from "node:fs";
import { contentType } from "@std/media-types";
import { extname } from "@std/path";
import type { ReleaseConfigOutput } from "../schemas/configs/modules/release-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { getTextFileOrThrow } from "./file.ts";
import { taskLogger } from "./logger.ts";
import { resolveStringTemplateOrThrow } from "./string-templates-and-patterns/resolve-template.ts";
import { basename } from "@std/path";
import { consumeAsyncIterable } from "../utils/async.ts";
import { pooledMap } from "@std/async";

type CreateReleaseInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "workspacePath" | "sourceMode"
>;

interface CreateReleaseConfigParams {
  release: Pick<
    ReleaseConfigOutput,
    | "tagNameTemplate"
    | "prerelease"
    | "draft"
    | "setLatest"
    | "titleTemplate"
    | "titleTemplatePath"
    | "bodyTemplate"
    | "bodyTemplatePath"
  >;
}

export async function createRelease(
  provider: PlatformProvider,
  inputs: CreateReleaseInputsParams,
  config: CreateReleaseConfigParams,
) {
  const { triggerCommitHash, workspacePath, sourceMode } = inputs;
  const {
    tagNameTemplate,
    prerelease,
    draft,
    setLatest,
    titleTemplate,
    titleTemplatePath,
    bodyTemplate,
    bodyTemplatePath,
  } = config.release;

  let releaseNoteTitle: string | undefined;
  if (titleTemplatePath) {
    const releaseTitleTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[titleTemplatePath] ?? sourceMode.mode,
      titleTemplatePath,
      { provider, workspacePath, ref: triggerCommitHash },
    );
    releaseNoteTitle = await resolveStringTemplateOrThrow(releaseTitleTemplate);
  } else {
    releaseNoteTitle = await resolveStringTemplateOrThrow(titleTemplate);
  }

  let releaseNoteBody: string | undefined;
  if (bodyTemplatePath) {
    const releaseBodyTemplate = await getTextFileOrThrow(
      sourceMode.overrides?.[bodyTemplatePath] ?? sourceMode.mode,
      bodyTemplatePath,
      { provider, workspacePath, ref: triggerCommitHash },
    );
    releaseNoteBody = await resolveStringTemplateOrThrow(releaseBodyTemplate);
  } else {
    releaseNoteBody = await resolveStringTemplateOrThrow(bodyTemplate);
  }

  const createdRelease = await provider.createReleaseOrThrow(
    await resolveStringTemplateOrThrow(tagNameTemplate),
    releaseNoteTitle,
    releaseNoteBody,
    { prerelease, draft, setLatest },
  );
  taskLogger.info(`Release created: ${createdRelease.url}`);

  return createdRelease;
}

export async function attachReleaseAssets(
  provider: PlatformProvider,
  releaseId: string | number,
  assetPaths: string[],
) {
  const MAX_CONCURRENT_UPLOADS = 5;

  taskLogger.info(
    `Preparing to attach ${assetPaths.length} assets (${MAX_CONCURRENT_UPLOADS} concurrent uploads allowed)...`,
  );

  // Pre-fetch sizes without reading files into memory
  const uploadTargets = await Promise.all(
    assetPaths.map(async (path) => {
      const fileStat = await fsPromises.stat(path);
      if (!fileStat.isFile()) {
        taskLogger.info(`Skipping ${path}: Not a file`);
        return null;
      }

      return {
        filePath: path,
        fileName: basename(path),
        sizeBytes: fileStat.size,
      };
    }),
  );

  const filteredUploadTargets = uploadTargets.filter((
    t,
  ): t is NonNullable<typeof t> => Boolean(t));

  await consumeAsyncIterable(
    pooledMap(MAX_CONCURRENT_UPLOADS, filteredUploadTargets, async (target) => {
      const sizeMb = (target.sizeBytes / 1024 / 1024).toFixed(2);
      taskLogger.info(`↑ Uploading: ${target.fileName} (${sizeMb} MB)`);

      await provider.attachReleaseAssetOrThrow(
        releaseId.toString(),
        {
          name: target.fileName,
          bytes: target.sizeBytes,
          contentType: contentType(extname(target.filePath)) ??
            "application/octet-stream",
          createDataStream: () => fs.createReadStream(target.filePath),
        },
      );
    }),
  );
}
