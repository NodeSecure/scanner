/**
 * @example
 * cleanRange(">=1.5.0"); // 1.5.0
 * cleanRange("^2.0.0"); // 2.0.0
 */
export function cleanRange(
  version: string
): string {
  // TODO: how do we handle complicated range like pkg-name@1 || 2 or pkg-name@2.1.2 < 3
  const firstChar = version.charAt(0);
  if (firstChar === "^" || firstChar === "<" || firstChar === ">" || firstChar === "=" || firstChar === "~") {
    return version.slice(version.charAt(1) === "=" ? 2 : 1);
  }

  return version;
}
