export interface ProviderLabel {
  name: string;
  color: string;
  description?: string;
}

export interface ProviderInputLabel {
  name: string;
  color: string;
  description?: string;
  createIfMissing: boolean;
}
