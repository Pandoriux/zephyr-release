export class NoCommitFoundError extends Error {
  constructor(
    message = "No commit found.",
    opts?: ErrorOptions,
  ) {
    super(message, opts);

    this.name = NoCommitFoundError.name;
  }
}
