// Require Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";
import { getSemVerWarning } from "../../src/utils/index.js";

// CONSTANTS
const KVersionsToWarn = new Set(["0.0.0", "0.0", "0"]);

const [firstVersion, secondVersion, lastVersion] = KVersionsToWarn.values();

describe("getSemVerWarning", () => {
  test("should return a warning for version '0.0.0'.", () => {
    assert.equal(KVersionsToWarn.has(firstVersion), true);

    const expectedWarning = {
      skind: "invalid-semver",
      file: "package.json",
      value: firstVersion,
      location: null,
      i18n: "sast_warnings.invalidSemVer",
      severity: "Information",
      experimental: false
    };

    assert.deepEqual(getSemVerWarning(firstVersion), expectedWarning);
  });

  test("should return a warning for version '0.0'.", () => {
    assert.equal(KVersionsToWarn.has(secondVersion), true);

    const expectedWarning = {
      skind: "invalid-semver",
      file: "package.json",
      value: secondVersion,
      location: null,
      i18n: "sast_warnings.invalidSemVer",
      severity: "Information",
      experimental: false
    };

    assert.deepEqual(getSemVerWarning(secondVersion), expectedWarning);
  });

  test("should return a warning for version '0'.", () => {
    assert.equal(KVersionsToWarn.has(lastVersion), true);

    const expectedWarning = {
      skind: "invalid-semver",
      file: "package.json",
      value: lastVersion,
      location: null,
      i18n: "sast_warnings.invalidSemVer",
      severity: "Information",
      experimental: false
    };

    assert.deepEqual(getSemVerWarning(lastVersion), expectedWarning);
  });
});


