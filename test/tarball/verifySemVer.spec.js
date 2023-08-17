// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSemVerWarning } from "../../src/utils/index.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "..", "fixtures", "verifySemVer");

describe("getSemVerWarning", () => {
  test("should return a warning for version '0.0.0'.", () => {
    const expectedWarning = {
      kind: "invalid-semver",
      file: "package.json",
      value: "0.0.0",
      location: null,
      i18n: "sast_warnings.invalidSemVer",
      severity: "Information",
      experimental: false
    };

    assert.deepEqual(getSemVerWarning("0.0.0"), expectedWarning);
  });

  test("should return a warning for version '0.0'.", () => {
    const expectedWarning = {
      kind: "invalid-semver",
      file: "package.json",
      value: "0.0",
      location: null,
      i18n: "sast_warnings.invalidSemVer",
      severity: "Information",
      experimental: false
    };

    assert.deepEqual(getSemVerWarning("0.0"), expectedWarning);
  });

  test("should return a warning for version '0'.", () => {
    const expectedWarning = {
      kind: "invalid-semver",
      file: "package.json",
      value: "0",
      location: null,
      i18n: "sast_warnings.invalidSemVer",
      severity: "Information",
      experimental: false
    };

    assert.deepEqual(getSemVerWarning("0"), expectedWarning);
  });

  test("verify semver parsing error (fixture package.json)", async() => {
    const packageJsonPath = path.join(kFixturePath, "package.json");
    const { version } = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

    const expectedWarning = {
      kind: "invalid-semver",
      file: "package.json",
      value: version,
      location: null,
      i18n: "sast_warnings.invalidSemVer",
      severity: "Information",
      experimental: false
    };

    assert.deepEqual(getSemVerWarning(version), expectedWarning);
  });
});
