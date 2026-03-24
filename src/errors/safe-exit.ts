export class SafeExit extends Error {
  constructor(message = "Safe exit", opts?: ErrorOptions) {
    super(message, opts);

    this.name = SafeExit.name;
  }
}
