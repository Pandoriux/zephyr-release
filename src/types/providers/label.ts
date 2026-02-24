export interface ProviderLabel {
  name: string;
  color?: string;
  description?: string;
}

export type ProviderLabelOptions =
  | {
      createIfMissing: false;
      labels: string[];
    }
  | {
      createIfMissing: true;
      labels: ProviderLabel[];
    };