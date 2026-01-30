export interface ProviderInputs {
  token?: string;
  triggerCommitHash?: string;
  triggerBranchName?: string;
  workspacePath?: string;
  configPath?: string;
  configFormat?: string;
  configOverride?: string;
  configOverrideFormat?: string;
  sourceMode?: string;
}
