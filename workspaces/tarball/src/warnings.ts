// Import Third-party Dependencies
import type { Warning } from "@nodesecure/js-x-ray";

export function getSemVerWarning(
  value: string
): Warning {
  return {
    kind: "zero-semver",
    file: "package.json",
    value,
    location: null,
    i18n: "sast_warnings.zero_semver",
    severity: "Information",
    source: "Scanner",
    experimental: false
  };
}

export function getEmptyPackageWarning(): Warning {
  return {
    kind: "empty-package",
    file: "package.json",
    value: "package.json",
    location: null,
    i18n: "sast_warnings.empty_package",
    severity: "Critical",
    source: "Scanner",
    experimental: false
  };
}
