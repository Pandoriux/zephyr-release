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
