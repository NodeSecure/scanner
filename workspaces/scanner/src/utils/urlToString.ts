export function urlToString(
  uri: string | URL
): string {
  return typeof uri === "string" ?
    new URL(uri).toString() :
    uri.toString();
}
