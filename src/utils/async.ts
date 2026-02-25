export async function consumeAsyncIterable<T>(
  iterable: AsyncIterable<T>,
  callback?: (item: T) => void | Promise<void>,
): Promise<void> {
  for await (const item of iterable) {
    if (callback) {
      await callback(item);
    }
  }
}
