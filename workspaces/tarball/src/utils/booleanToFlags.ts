/**
 * @example
 * console.log(...booleanToFlags({ hasScript: true })); // "hasScript"
 */
export function* booleanToFlags(
  flagsRecord: Record<string, boolean>
): IterableIterator<string> {
  for (const [flagName, boolValue] of Object.entries(flagsRecord)) {
    if (boolValue) {
      yield flagName;
    }
  }
}
