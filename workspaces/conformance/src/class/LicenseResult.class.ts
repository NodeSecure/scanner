// Import Internal Dependencies
import {
  licenseIdConformance,
  searchSpdxLicenseId,
  type SpdxLicenseConformance
} from "../parse.js";

export interface SpdxFileLicenseConformance extends SpdxLicenseConformance {
  fileName: string;
}

export interface SpdxUnidentifiedLicense {
  licenseId: string;
  reason: string;
}

export interface SpdxExtractedResult {
  /**
   * List of licenses, each with its SPDX conformance details.
   * This array includes all licenses found, conforming to the SPDX standards.
   */
  licenses: SpdxFileLicenseConformance[];

  /**
   * A unique list of license identifiers (e.g., 'MIT', 'ISC').
   * This list does not contain any duplicate entries.
   * It represents the distinct licenses identified.
   */
  uniqueLicenseIds: string[];

  /**
   * List of licenses that do not conform to SPDX standards or have invalid/unidentified identifiers.
   * This array includes licenses that could not be matched to valid SPDX identifiers.
   */
  unidentifiedLicenseIds?: SpdxUnidentifiedLicense[];
}

export class LicenseResult {
  #uniqueLicenseIds: Set<string> = new Set();
  #invalidLicenseIds: Map<string, string> = new Map();
  #licenses: SpdxFileLicenseConformance[] = [];

  addLicenseIDFromSource(source: string, file: string) {
    const licenseID = searchSpdxLicenseId(source);
    if (licenseID !== null) {
      this.addLicenseID(licenseID, file);
    }

    return this;
  }

  addLicenseID(licenseID: string, source: string) {
    const conformanceResult = licenseIdConformance(licenseID);
    if (conformanceResult.err) {
      this.#invalidLicenseIds.set(licenseID, conformanceResult.val.message);

      return this;
    }

    const license: SpdxFileLicenseConformance = {
      ...conformanceResult.safeUnwrap(),
      fileName: source
    };
    Object.keys(license.licenses)
      .forEach((id) => this.#uniqueLicenseIds.add(id));

    this.#licenses.push(license);

    return this;
  }

  toJSON(): SpdxExtractedResult {
    const unidentifiedLicenseIds: SpdxUnidentifiedLicense[] = [...this.#invalidLicenseIds.entries()]
      .map(([licenseId, reason]) => {
        return { licenseId, reason };
      });

    return {
      licenses: this.#licenses,
      uniqueLicenseIds: [...this.#uniqueLicenseIds],
      ...(unidentifiedLicenseIds.length > 0 ? { unidentifiedLicenseIds } : {})
    };
  }
}
