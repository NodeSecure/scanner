// Import Node.js Dependencies
import * as path from "node:path";
import * as fsSync from "node:fs";
import * as fs from "node:fs/promises";

// Import Internal Dependencies
import * as utils from "./utils/index.js";
import {
  LicenseResult,
  type SpdxUnidentifiedLicense,
  type SpdxFileLicenseConformance,
  type SpdxExtractedResult
} from "./class/LicenseResult.class.js";

// CONSTANTS
const kManifestFileName = "package.json";

export interface ExtractAsyncOptions {
  fsEngine?: typeof fs;
}

export async function extractLicenses(
  location: string,
  options: ExtractAsyncOptions = {}
): Promise<SpdxExtractedResult> {
  const { fsEngine = fs } = options;

  const packageStr = await fsEngine.readFile(
    path.join(location, kManifestFileName), "utf-8"
  );
  const packageJSON = JSON.parse(packageStr);

  const licenseData = new LicenseResult();
  licenseData.addLicenseID(
    utils.parsePackageLicense(packageJSON),
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
  location: string,
  options: ExtractSyncOptions = {}
): SpdxExtractedResult {
  const { fsEngine = fsSync } = options;

  const packageStr = fsEngine.readFileSync(
    path.join(location, kManifestFileName), "utf-8"
  );
  const packageJSON = JSON.parse(packageStr);

  const licenseData = new LicenseResult();
  licenseData.addLicenseID(
    utils.parsePackageLicense(packageJSON),
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
