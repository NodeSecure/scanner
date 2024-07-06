// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import {
  LicenseResult,
  type SpdxExtractedResult
} from "../../src/class/LicenseResult.class.js";

const kMITSpdxConformance: SpdxExtractedResult = {
  uniqueLicenseIds: ["MIT"],
  licenses: [
    {
      licenses: {
        MIT: "https://spdx.org/licenses/MIT.html#licenseText"
      },
      spdx: {
        fsf: true,
        fsfAndOsi: true,
        includesDeprecated: false,
        osi: true
      },
      fileName: "LICENSE"
    }
  ]
};

describe("LicenseResult", () => {
  it("should add the license to the invalid list if not known", () => {
    const lr = new LicenseResult();
    lr.addLicenseID("notalicense", "foobar");

    const result = lr.toJSON();
    assert.deepStrictEqual(
      result.unidentifiedLicenseIds,
      [
        {
          licenseId: "notalicense",
          reason: "Passed license expression 'notalicense' was not a valid license expression."
        }
      ]
    );
    assert.strictEqual(result.licenses.length, 0);
  });

  it("should add MIT using a source", () => {
    const lr = new LicenseResult();
    lr.addLicenseIDFromSource("blabla MIT License yooyo", "LICENSE");

    const result = lr.toJSON();
    assert.deepEqual(result, kMITSpdxConformance);
  });

  it("should add MIT license and hasMultipleLicenses should be false", () => {
    const lr = new LicenseResult();
    lr.addLicenseID("MIT", "LICENSE");

    const result = lr.toJSON();
    assert.deepEqual(result, kMITSpdxConformance);
  });

  it("should add MIT and ISC licenses and hasMultipleLicenses should be true", () => {
    const licenseSource = "LICENSE";
    const lr = new LicenseResult();
    lr.addLicenseID("ISC", "package.json");
    lr.addLicenseID("MIT", licenseSource);

    const result = lr.toJSON();
    assert.deepStrictEqual(result.uniqueLicenseIds, ["ISC", "MIT"]);
    assert.strictEqual(result.licenses.length, 2);
  });
});
