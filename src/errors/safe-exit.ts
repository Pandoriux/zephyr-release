export class SafeExit extends Error {
  override name = "SafeExit";

  constructor(message = "Safe exit") {
    super(message);
  }
}
