/**
 * @param {Record<string, boolean>} flagsRecord
 * @example
 * console.log(...booleanToFlags({ hasScript: true })); // "hasScript"
 */
export function* booleanToFlags(flagsRecord) {
  for (const [flagName, boolValue] of Object.entries(flagsRecord)) {
    if (boolValue) {
      yield flagName;
    }
  }
}
