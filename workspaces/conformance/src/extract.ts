// Import Node.js Dependencies
import * as path from "node:path";
import * as fsSync from "node:fs";
import * as fs from "node:fs/promises";

// Import Third-party Dependencies
import { ManifestManager } from "@nodesecure/mama";

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
const kInvalidLicense = "invalid license";

export type ManifestManagerLike = string | ManifestManager;

function getManifestManagerAndDirAsync(
  input: ManifestManagerLike
): Promise<{ mama: ManifestManager; dir: string; }> {
  if (typeof input === "string") {
    return ManifestManager.fromPackageJSON(input).then((mama) => {
      return {
        mama,
        dir: input
      };
    });
  }
  else if (input instanceof ManifestManager) {
    const manifestPath = input.manifestLocation;
    if (!manifestPath) {
      throw new Error("ManifestManager instance must have a manifestLocation property set.");
    }
    const dir = path.dirname(manifestPath);

    return Promise.resolve({ mama: input, dir });
  }
  throw new TypeError("Input must be a string or a ManifestManager instance");
}

function getManifestManagerAndDirSync(
  input: ManifestManagerLike,
  fsEngine: typeof fsSync
): { mama: ManifestManager; dir: string; } {
  if (typeof input === "string") {
    const packageStr = fsEngine.readFileSync(
      path.join(input, kManifestFileName), "utf-8"
    );

    const packageJSON = JSON.parse(packageStr);

    return {
      mama: new ManifestManager(packageJSON, path.join(input, kManifestFileName)),
      dir: input
    };
  }
  else if (input instanceof ManifestManager) {
    const manifestPath = input.manifestLocation;
    if (!manifestPath) {
      throw new Error("ManifestManager instance must have a manifestLocation property set.");
    }
    const dir = path.dirname(manifestPath);

    return { mama: input, dir };
  }
  throw new TypeError("Input must be a string or a ManifestManager instance");
}

export interface ExtractAsyncOptions {
  fsEngine?: typeof fs;
}

export async function extractLicenses(
  input: ManifestManagerLike,
  options: ExtractAsyncOptions = {}
): Promise<SpdxExtractedResult> {
  const { fsEngine = fs } = options;
  const { mama, dir } = await getManifestManagerAndDirAsync(input);

  const licenseData = new LicenseResult()
    .addLicenseID(
      mama.license ?? kInvalidLicense,
      kManifestFileName
    );

  const dirents = await fsEngine.readdir(dir, {
    withFileTypes: true
  });
  await Promise.allSettled(
    utils.extractDirentLicenses(dirents).map(async(file) => {
      const contentStr = await fsEngine.readFile(
        path.join(dir, file),
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
  input: ManifestManagerLike,
  options: ExtractSyncOptions = {}
): SpdxExtractedResult {
  const { fsEngine = fsSync } = options;
  const { mama, dir } = getManifestManagerAndDirSync(input, fsEngine);

  const licenseData = new LicenseResult();
  licenseData.addLicenseID(
    mama.license ?? kInvalidLicense,
    kManifestFileName
  );

  const dirents = fsEngine.readdirSync(dir, {
    withFileTypes: true
  });
  for (const file of utils.extractDirentLicenses(dirents)) {
    const contentStr = fsEngine.readFileSync(
      path.join(dir, file),
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
