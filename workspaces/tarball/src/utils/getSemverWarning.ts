// // Import Third-party Dependencies
import type { WarningDefault } from "@nodesecure/js-x-ray";

export function getSemVerWarning(
  value: string
): WarningDefault<"zero-semver"> {
  return {
    kind: "zero-semver",
    file: "package.json",
    value,
    location: null,
    i18n: "sast_warnings.zeroSemVer",
    severity: "Information",
    source: "Scanner",
    experimental: false
  };
}
