export class BranchOutOfDateError extends Error {
  constructor(
    message =
      "Failed to update branch because it is out of date. The branch has moved forward.",
    opts?: ErrorOptions,
  ) {
    super(message, opts);

    this.name = BranchOutOfDateError.name;
  }
}
