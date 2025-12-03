// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import {
  closestSpdxLicenseID,
  checkSpdx
} from "../src/licenses.ts";

describe("closestSpdxLicenseID", () => {
  test("it should return the given LicenseID if no record match", () => {
    assert.equal(closestSpdxLicenseID("foooobar"), "foooobar");
  });

  test("it should fix 'BSD 3-Clause' to 'BSD-3-Clause'", () => {
    assert.equal(closestSpdxLicenseID("BSD 3-Clause"), "BSD-3-Clause");
  });

  test("it should not fix 'BSD 3 Clause' because the distance is greater than one", () => {
    assert.equal(closestSpdxLicenseID("BSD 3 Clause"), "BSD 3 Clause");
  });
});

describe("checkSpdx", () => {
  test("test with MIT license", () => {
    const mitLicense = checkSpdx("MIT");
    assert.deepEqual(mitLicense, {
      osi: true,
      fsf: true,
      fsfAndOsi: true,
      includesDeprecated: false
    });
  });

  test("test with a deprecated license", () => {
    const deprecatedLicense = checkSpdx("AGPL-1.0");
    assert.deepEqual(deprecatedLicense, {
      osi: false,
      fsf: true,
      fsfAndOsi: false,
      includesDeprecated: true
    });
  });

  test("test with a broken license", () => {
    const brokenLicense = checkSpdx("wrong");
    assert.deepEqual(brokenLicense, {
      osi: false,
      fsf: false,
      fsfAndOsi: false,
      includesDeprecated: false
    });
  });
});
