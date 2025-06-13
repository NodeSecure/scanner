// Import Node.js Dependencies
import path from "node:path";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import { ManifestManager } from "@nodesecure/mama";

// Import Internal Dependencies
import {
  extractLicenses,
  extractLicensesSync
} from "../src/index.js";
import expectedParsedLicense from "./fixtures/parseLicense.snap.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "fixtures");
const kFixtureProjectOne = path.join(kFixturePath, "project1");
const kFixtureProjectTwo = path.join(kFixturePath, "project2");

describe("extractLicenses", () => {
  it("should detect two licenses (ISC, MIT) in project1", async() => {
    const result = await extractLicenses(kFixtureProjectOne);

    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.deepStrictEqual(result, expectedParsedLicense);
  });

  it("should detect two licenses (ISC, MIT) in project1 using LocatedManifestManager", async() => {
    const mama = await ManifestManager.fromPackageJSON(
      kFixtureProjectOne
    );
    if (!ManifestManager.isLocated(mama)) {
      throw new Error("manifest must have a location");
    }

    const result = await extractLicenses(mama);

    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.deepStrictEqual(result, expectedParsedLicense);
  });

  it("should detect one license (Artistic-2.0) in project2", async() => {
    const result = await extractLicenses(
      kFixtureProjectTwo
    );

    assert.deepStrictEqual(
      result.uniqueLicenseIds,
      ["Artistic-2.0"]
    );
  });
});

describe("extractLicensesSync", () => {
  it("should detect two licenses (ISC, MIT) in project1", () => {
    const result = extractLicensesSync(kFixtureProjectOne);

    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.deepStrictEqual(result, expectedParsedLicense);
  });

  it("should detect two licenses (ISC, MIT) in project1 using LocatedManifestManager", () => {
    const mama = ManifestManager.fromPackageJSONSync(
      kFixtureProjectOne
    );
    if (!ManifestManager.isLocated(mama)) {
      throw new Error("manifest must have a location");
    }

    const result = extractLicensesSync(mama);

    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.deepStrictEqual(result, expectedParsedLicense);
  });

  it("should detect one license (Artistic-2.0) in project2", () => {
    const result = extractLicensesSync(
      kFixtureProjectTwo
    );

    assert.deepStrictEqual(
      result.uniqueLicenseIds,
      ["Artistic-2.0"]
    );
  });
});
