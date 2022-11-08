/**
 * It takes an unknown type and returns a string
 * @param {unknown} e - unknown - This is the error that we want to get the message
 * from.
 * @returns A function that takes an unknown type and returns a string.
 */
export function getErrors(e: unknown): string {
  let error;
  if (typeof e === "string") {
    error = e;
  } else if (e instanceof Error) {
    error = e.message;
  } else {
    error = "Unknown error";
  }
  return error;
}
