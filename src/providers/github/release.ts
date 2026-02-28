import type { GetOctokitFn, OctokitClient } from "./octokit.ts";
import type {
  ProviderAssetParams,
  ProviderRelease,
  ProviderReleaseOptions,
} from "../../types/providers/release.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";

async function githubCreateReleaseOrThrow(
  octokit: OctokitClient,
  tagName: string,
  title: string,
  body: string,
  options: ProviderReleaseOptions,
): Promise<ProviderRelease> {
  const res = await octokit.rest.repos.createRelease({
    owner: githubGetNamespace(),
    repo: githubGetRepositoryName(),

    tag_name: tagName,
    name: title,
    body: body,

    prerelease: options.prerelease,
    draft: options.draft,
    make_latest: options.setLatest ? "true" : "false",
  });

  return {
    id: res.data.id,
    url: res.data.html_url,
    uploadUrl: res.data.upload_url,
  };
}

async function githubAttachReleaseAssetOrThrow(
  octokit: OctokitClient,
  releaseId: string,
  asset: ProviderAssetParams,
) {
  const fileStream = asset.createDataStream();

  await octokit.request(
    "POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}",
    {
      owner: githubGetNamespace(),
      repo: githubGetRepositoryName(),
      release_id: releaseId,
      name: asset.name,
      data: fileStream,
      headers: {
        "content-type": asset.contentType,
        "content-length": asset.bytes.toString(),
      },
    },
  );
}

export function makeGithubCreateReleaseOrThrow(getOctokit: GetOctokitFn) {
  return (
    tagName: string,
    title: string,
    body: string,
    options: ProviderReleaseOptions,
  ) =>
    githubCreateReleaseOrThrow(
      getOctokit(),
      tagName,
      title,
      body,
      options,
    );
}

export function makeGithubAttachReleaseAssetOrThrow(getOctokit: GetOctokitFn) {
  return (releaseId: string, asset: ProviderAssetParams) =>
    githubAttachReleaseAssetOrThrow(getOctokit(), releaseId, asset);
}
