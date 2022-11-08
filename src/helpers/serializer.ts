import { JsonSerializer } from 'typescript-json-serializer';

/**
 * It creates a new instance of the JsonSerializer class
 * @returns A promise that resolves to a new JsonSerializer instance.
 */
export function createJsonSerializer() {
  return new JsonSerializer();
}
