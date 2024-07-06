// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { licenseIdConformance, searchSpdxLicenseId } from "../src/index.js";

describe("searchSpdxLicenseId", () => {
  test("search for Apache 2.0 license", () => {
    const result = searchSpdxLicenseId("Apache License 2.0");
    assert.strictEqual(result, "Apache-2.0");
  });

  test("search for Artistic 1.0 license", () => {
    const result = searchSpdxLicenseId("Artistic License 1.0");
    assert.strictEqual(result, "Artistic-1.0");
  });

  test("it should return null if there is no license matching name", () => {
    const result = searchSpdxLicenseId("not a license");
    assert.strictEqual(result, null);
  });
});

test("check the output of MIT license", () => {
  const mitLicense = licenseIdConformance("MIT").unwrap();
  assert.deepEqual(mitLicense,
    {
      licenses: {
        MIT: "https://spdx.org/licenses/MIT.html#licenseText"
      },
      spdx: {
        osi: true,
        fsf: true,
        fsfAndOsi: true,
        includesDeprecated: false
      }
    }
  );
});

test("check the output of BSD 3-Clause license (missing hyphen)", () => {
  const mitLicense = licenseIdConformance("BSD 3-Clause").unwrap();
  assert.deepEqual(mitLicense,
    {
      licenses: {
        "BSD-3-Clause": "https://spdx.org/licenses/BSD-3-Clause.html#licenseText"
      },
      spdx: {
        osi: true,
        fsf: true,
        fsfAndOsi: true,
        includesDeprecated: false
      }
    }
  );
});

test("check deprecated license cases", () => {
  const deprecatedLicense = licenseIdConformance("AGPL-1.0").unwrap();
  assert.deepEqual(deprecatedLicense, {
    licenses: {
      "AGPL-1.0": "https://spdx.org/licenses/AGPL-1.0.html#licenseText"
    },
    spdx: {
      osi: false,
      fsf: true,
      fsfAndOsi: false,
      includesDeprecated: true
    }
  });

  const multipleDeprecatedLicenses = licenseIdConformance("AGPL-1.0 AND AGPL-3.0").unwrap();
  assert.deepEqual(multipleDeprecatedLicenses, {
    licenses: {
      "AGPL-1.0": "https://spdx.org/licenses/AGPL-1.0.html#licenseText",
      "AGPL-3.0": "https://spdx.org/licenses/AGPL-3.0.html#licenseText"
    },
    spdx: {
      osi: false,
      fsf: true,
      fsfAndOsi: false,
      includesDeprecated: true
    }
  });
});

test("check two licenses that pass osi and fsf", () => {
  const licenses = licenseIdConformance("ISC OR MIT").unwrap();
  assert.deepEqual(licenses, {
    licenses: {
      ISC: "https://spdx.org/licenses/ISC.html#licenseText",
      MIT: "https://spdx.org/licenses/MIT.html#licenseText"
    },
    spdx: {
      osi: true,
      fsf: true,
      fsfAndOsi: true,
      includesDeprecated: false
    }
  });
});

test("complex license statement that does not pass osi but does pass fsf", () => {
  const licenses = licenseIdConformance("MIT OR (CC0-1.0 AND ISC)").unwrap();
  assert.deepEqual(licenses, {
    licenses: {
      ISC: "https://spdx.org/licenses/ISC.html#licenseText",
      "CC0-1.0": "https://spdx.org/licenses/CC0-1.0.html#licenseText",
      MIT: "https://spdx.org/licenses/MIT.html#licenseText"
    },
    spdx: {
      osi: false,
      fsf: true,
      fsfAndOsi: false,
      includesDeprecated: false
    }
  });
});

test("check license that should throw an Error", () => {
  assert.throws(
    () => licenseIdConformance("unreallicense").unwrap(),
    {
      name: "Error",
      message: "Passed license expression 'unreallicense' was not a valid license expression."
    }
  );
});
