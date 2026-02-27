import type fs from "node:fs";

export interface ProviderReleaseOptions {
  draft: boolean;
  prerelease: boolean;
  setLatest: boolean;
}

export interface ProviderRelease {
  id: string | number;
  url: string;

  uploadUrl?: string;
}

export interface ProviderAssetParams {
  name: string;
  bytes: number;
  contentType: string;
  createDataStream: () => fs.ReadStream;
}
