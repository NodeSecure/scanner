// Import Third-party Dependencies
import * as levenshtein from "fastest-levenshtein";

// Import Internal Dependencies
import { spdx } from "./data/spdx.ts";

export interface SpdxConformance {
  name: string;
  id: string;
  deprecated: boolean;
  osi: boolean;
  fsf: boolean;
}

// CONSTANTS
const kMaximumLicenseDistance = 1;
const kLevenshteinCache = new Map<string, string>();

const licenseNameToId = new Map<string, SpdxConformance>();
const osi: string[] = [];
const fsf: string[] = [];
const deprecated: string[] = [];

for (const [licenseId, license] of Object.entries(spdx)) {
  if (license.deprecated) {
    deprecated.push(licenseId);
  }
  if (license.osi) {
    osi.push(licenseId);
  }
  if (license.fsf) {
    fsf.push(licenseId);
  }
  licenseNameToId.set(license.name, license);
}

const spdxLicenseIds = new Set([
  ...deprecated,
  ...fsf,
  ...osi
]);

export function closestSpdxLicenseID(
  licenseID: string
): string {
  if (kLevenshteinCache.has(licenseID)) {
    return kLevenshteinCache.get(licenseID)!;
  }

  for (const iteratedLicenseId of spdxLicenseIds) {
    const distance = levenshtein.distance(licenseID, iteratedLicenseId);
    if (distance <= kMaximumLicenseDistance) {
      kLevenshteinCache.set(licenseID, iteratedLicenseId);

      return iteratedLicenseId;
    }
  }

  return licenseID;
}

export function checkSpdx(
  licenseToCheck: string
) {
  return {
    osi: osi.includes(licenseToCheck),
    fsf: fsf.includes(licenseToCheck),
    fsfAndOsi: osi.includes(licenseToCheck) && fsf.includes(licenseToCheck),
    includesDeprecated: deprecated.includes(licenseToCheck)
  };
}

export {
  osi,
  fsf,
  deprecated,
  licenseNameToId,
  spdxLicenseIds
};
