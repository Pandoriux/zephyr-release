import fsPromises from "node:fs/promises";
import fs from "node:fs";
import { contentType } from "@std/media-types";
import { extname } from "@std/path";
import type { TagConfigOutput } from "../schemas/configs/modules/tag-config.ts";
import type { ReleaseConfigOutput } from "../schemas/configs/modules/release-config.ts";
import type { InputsOutput } from "../schemas/inputs/inputs.ts";
import type { PlatformProvider } from "../types/providers/platform-provider.ts";
import { getTextFile } from "./file.ts";
import { taskLogger } from "./logger.ts";
import { resolveStringTemplate } from "./string-templates-and-patterns/resolve-template.ts";
import { basename } from "@std/path";
import { consumeAsyncIterable } from "../utils/async.ts";
import { pooledMap } from "@std/async";

type CreateReleaseInputsParams = Pick<
  InputsOutput,
  "triggerCommitHash" | "workspacePath" | "sourceMode"
>;

interface CreateReleaseConfigParams {
  tag: Pick<TagConfigOutput, "nameTemplate">;
  release: Pick<
    ReleaseConfigOutput,
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
  const { tag } = config;
  const {
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
    const releaseTitleTemplate = await getTextFile(
      sourceMode.overrides?.[titleTemplatePath] ?? sourceMode.mode,
      titleTemplatePath,
      { provider, workspacePath, ref: triggerCommitHash },
    );
    releaseNoteTitle = await resolveStringTemplate(releaseTitleTemplate);
  } else {
    releaseNoteTitle = await resolveStringTemplate(titleTemplate);
  }

  let releaseNoteBody: string | undefined;
  if (bodyTemplatePath) {
    const releaseBodyTemplate = await getTextFile(
      sourceMode.overrides?.[bodyTemplatePath] ?? sourceMode.mode,
      bodyTemplatePath,
      { provider, workspacePath, ref: triggerCommitHash },
    );
    releaseNoteBody = await resolveStringTemplate(releaseBodyTemplate);
  } else {
    releaseNoteBody = await resolveStringTemplate(bodyTemplate);
  }

  const createdRelease = await provider.createRelease(
    await resolveStringTemplate(tag.nameTemplate),
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

      await provider.attachReleaseAsset(
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
