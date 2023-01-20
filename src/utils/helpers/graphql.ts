const graphEnums = ["gender", "interface_type"]


// TODO[Philip]: This is a hack. I need to find a better way to do this.
export function JSONToRawString(JsonObject: Record<any, any>): string {
  if (typeof JsonObject !== "object" || Array.isArray(JsonObject)) {
    return JSON.stringify(JsonObject)
  }
  let rawString = Object
    .keys(JsonObject)
    .map(key => {
      if (graphEnums.includes(key)) {
        return `${key}: ${JsonObject[key]}`;
      } else {
        return `${key}:${JSONToRawString(JsonObject[key])}`
      }
    }).join(",");
  return `{${rawString}}`;
}