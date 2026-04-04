export class FileNotFoundError extends Error {
  constructor(message = "File not found", opts?: ErrorOptions) {
    super(message, opts);
    this.name = FileNotFoundError.name;
  }
}
