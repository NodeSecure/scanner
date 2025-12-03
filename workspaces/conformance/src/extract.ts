// Import Node.js Dependencies
import * as path from "node:path";
import * as fsSync from "node:fs";
import * as fs from "node:fs/promises";

// Import Third-party Dependencies
import {
  ManifestManager,
  type LocatedManifestManager
} from "@nodesecure/mama";

// Import Internal Dependencies
import * as utils from "./utils/index.ts";
import {
  LicenseResult,
  type SpdxUnidentifiedLicense,
  type SpdxFileLicenseConformance,
  type SpdxExtractedResult
} from "./class/LicenseResult.class.ts";

// CONSTANTS
const kManifestFileName = "package.json";
const kInvalidLicense = "invalid license";

export interface ExtractAsyncOptions {
  fsEngine?: typeof fs;
}

export async function extractLicenses(
  manifestOrLocation: string | LocatedManifestManager,
  options: ExtractAsyncOptions = {}
): Promise<SpdxExtractedResult> {
  const { fsEngine = fs } = options;

  const mama = await ManifestManager.fromPackageJSON(
    manifestOrLocation
  );
  const location = mama.location!;

  const licenseData = new LicenseResult()
    .addLicenseID(
      mama.license ?? kInvalidLicense,
      kManifestFileName
    );

  const dirents = await fsEngine.readdir(location, {
    withFileTypes: true
  });
  await Promise.allSettled(
    utils.extractDirentLicenses(dirents).map(async(file) => {
      const contentStr = await fsEngine.readFile(
        path.join(location, file),
        "utf-8"
      );
      licenseData.addLicenseIDFromSource(contentStr, file);
    })
  );

  return licenseData.toJSON();
}

export interface ExtractSyncOptions {
  fsEngine?: typeof fsSync;
}

export function extractLicensesSync(
  manifestOrLocation: string | LocatedManifestManager,
  options: ExtractSyncOptions = {}
): SpdxExtractedResult {
  const { fsEngine = fsSync } = options;

  const mama = ManifestManager.fromPackageJSONSync(
    manifestOrLocation
  );
  const location = mama.location!;

  const licenseData = new LicenseResult();
  licenseData.addLicenseID(
    mama.license ?? kInvalidLicense,
    kManifestFileName
  );

  const dirents = fsEngine.readdirSync(location, {
    withFileTypes: true
  });
  for (const file of utils.extractDirentLicenses(dirents)) {
    const contentStr = fsEngine.readFileSync(
      path.join(location, file),
      "utf-8"
    );
    licenseData.addLicenseIDFromSource(contentStr, file);
  }

  return licenseData.toJSON();
}

export type {
  SpdxUnidentifiedLicense,
  SpdxFileLicenseConformance,
  SpdxExtractedResult
};
