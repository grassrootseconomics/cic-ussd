import { createHash } from 'crypto';


/**
 * It takes a string or an array of strings and returns a hash of the strings
 * @param {string | string[]} identifier - This is the identifier that you want to
 * create a pointer for. It can be a string or an array of strings.
 * @returns A hash of the identifier
 */
export function createPointer(identifier: string | string[]){
  const hashBuilder = createHash('sha256');
  if (Array.isArray(identifier)) {
    identifier.forEach((id) => hashBuilder.update(id));
  } else {
    hashBuilder.update(identifier);
  }
  return hashBuilder.digest('hex');
}
