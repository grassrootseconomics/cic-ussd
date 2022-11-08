export function camelCase(str: string) {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

export function keysToCamelCase(obj: Record<string, string>) {
  const n: Record<string, string> = {};
  Object.keys(obj).forEach((k) => {
    n[camelCase(k)] = obj[k];
  });
  return n;
}
