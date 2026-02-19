import type { OctokitClient } from "./octokit.ts";
import type {
  ProviderRelease,
  ProviderReleaseOptions,
} from "../../types/providers/release.ts";
import { githubGetNamespace, githubGetRepositoryName } from "./repository.ts";

export async function githubCreateReleaseOrThrow(
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
