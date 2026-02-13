export type ProviderConcurrencyResult =
  | {
    isLatestExecution: true;
    currentExecutionId: string;
    hasIncompleteHistory: boolean;
  }
  | {
    isLatestExecution: false;
    currentExecutionId: string;
    newerExecutionId: string;
  };
