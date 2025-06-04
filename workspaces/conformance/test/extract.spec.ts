// Import Node.js Dependencies
import path from "node:path";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import fs from "node:fs/promises";
import fsSync from "node:fs";

// Import Internal Dependencies
import {
  extractLicenses,
  extractLicensesSync
} from "../src/index.js";
import expectedParsedLicense from "./fixtures/parseLicense.snap.js";
import { ManifestManager } from "@nodesecure/mama";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "fixtures");

describe("extractLicenses", () => {
  it("should detect two licenses (ISC, MIT) in project1", async() => {
    const result = await extractLicenses(path.join(kFixturePath, "project1"));

    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.deepStrictEqual(result, expectedParsedLicense);
  });

  it("should detect one license (Artistic-2.0) in project2", async() => {
    const result = await extractLicenses(path.join(kFixturePath, "project2"));

    assert.deepStrictEqual(result.uniqueLicenseIds, ["Artistic-2.0"]);
  });

  it("should work with a ManifestManager instance (async)", async() => {
    const projectPath = path.join(kFixturePath, "project1");
    const manifestPath = path.join(projectPath, "package.json");
    const packageStr = await fs.readFile(manifestPath, "utf-8");
    const packageJSON = JSON.parse(packageStr);
    const mama = new ManifestManager(packageJSON, manifestPath);
    const result = await extractLicenses(mama);
    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.deepStrictEqual(result, expectedParsedLicense);
  });
});

describe("extractLicensesSync", () => {
  it("should detect two licenses (ISC, MIT) in project1", async() => {
    const result = extractLicensesSync(path.join(kFixturePath, "project1"));

    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.deepStrictEqual(result, expectedParsedLicense);
  });

  it("should detect one license (Artistic-2.0) in project2", async() => {
    const result = extractLicensesSync(path.join(kFixturePath, "project2"));

    assert.deepStrictEqual(result.uniqueLicenseIds, ["Artistic-2.0"]);
  });

  it("should work with a ManifestManager instance (sync)", () => {
    const projectPath = path.join(kFixturePath, "project1");
    const manifestPath = path.join(projectPath, "package.json");
    const packageStr = fsSync.readFileSync(manifestPath, "utf-8");
    const packageJSON = JSON.parse(packageStr);
    const mama = new ManifestManager(packageJSON, manifestPath);
    const result = extractLicensesSync(mama);
    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.deepStrictEqual(result, expectedParsedLicense);
  });
});
