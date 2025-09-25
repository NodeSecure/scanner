// Import Third-party Dependencies
import {
  warnings as originalWarnings,
  type Warning,
  type WarningName
} from "@nodesecure/js-x-ray/warnings";

export type TarballWarningName =
  | WarningName
  | "zero-semver"
  | "empty-package";

export const warnings = Object.freeze({
  ...originalWarnings,
  "zero-semver": {
    i18n: "sast_warnings.zero_semver",
    experimental: false,
    severity: "Information"
  },
  "empty-package": {
    i18n: "sast_warnings.empty_package",
    experimental: false,
    severity: "Warning"
  }
}) satisfies Record<TarballWarningName, Pick<Warning, "experimental" | "i18n" | "severity">>;

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
