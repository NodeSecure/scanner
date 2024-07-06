// Import Node.js Dependencies
import { describe, it, test } from "node:test";
import { Dirent } from "node:fs";
import assert from "node:assert";

// Import Internal Dependencies
import * as utils from "../src/utils/index.js";

describe("checkEveryTruthy", () => {
  test("check a single true is true", () => {
    assert.equal(utils.checkEveryTruthy(true), true);
  });

  test("check multiple true booleans are true", () => {
    assert.equal(utils.checkEveryTruthy(true, true, true), true);
  });

  test("check that a single false is false", () => {
    assert.equal(utils.checkEveryTruthy(false), false);
  });

  test("ensure that one false will result in a false return", () => {
    assert.equal(utils.checkEveryTruthy(true, false), false);
  });
});

describe("checkSomeTruthy", () => {
  test("check a single true is true", () => {
    assert.equal(utils.checkSomeTruthy(true), true);
  });

  test("check multiple true booleans are true", () => {
    assert.equal(utils.checkSomeTruthy(true, true, true), true);
  });

  test("check that a single false is false", () => {
    assert.equal(utils.checkSomeTruthy(false), false);
  });

  test("ensure that one false will result in a true return", () => {
    assert.equal(utils.checkSomeTruthy(true, false), true);
  });
});

describe("createSpdxLink", () => {
  test("create an MIT SPDX link", () => {
    const link = utils.createSpdxLink("MIT");

    assert.strictEqual(link, "https://spdx.org/licenses/MIT.html#licenseText");
  });
});

describe("extractDirentLicenses", () => {
  it("should only extract file dirent that include 'license' in their name", () => {
    const dirents = [
      createDirent("foobar", false),
      createDirent("LicenseFile"),
      createDirent("yoyoo")
    ];

    assert.deepEqual(
      utils.extractDirentLicenses(dirents),
      ["LicenseFile"]
    );
  });
});

describe("parsePackageLicense", () => {
  it("should return 'MIT' for parsePackageLicense license MIT", () => {
    const result = utils.parsePackageLicense({
      license: "MIT"
    });
    assert.strictEqual(result, "MIT");
  });

  it("should return 'MIT AND (CC0-1.0 OR ISC)' for parsePackageLicense of Object", () => {
    const result = utils.parsePackageLicense({
      license: {
        type: "MIT AND (CC0-1.0 OR ISC)"
      }
    });
    assert.strictEqual(result, "MIT AND (CC0-1.0 OR ISC)");
  });

  test("parsePackageLicense of payload with licenses property", () => {
    const result = utils.parsePackageLicense({
      licenses: {
        type: "MIT AND (CC0-1.0 OR ISC)"
      }
    });
    assert.strictEqual(result, "MIT AND (CC0-1.0 OR ISC)");
  });

  test("parsePackageLicense of payload with licenses property as Array", () => {
    const result = utils.parsePackageLicense({
      licenses: [
        {
          type: "ISC"
        }
      ]
    });
    assert.strictEqual(result, "ISC");
  });

  it("should return 'invalid license' for a PackageJSON with no licenses", () => {
    const result = utils.parsePackageLicense({});
    assert.strictEqual(result, "invalid license");
  });
});

describe("handleUndefinedAndNull", () => {
  it("should return 'invalid license' for null or undefined", () => {
    assert.strictEqual(
      utils.handleUndefinedAndNull(),
      "invalid license"
    );
    assert.strictEqual(
      utils.handleUndefinedAndNull(undefined),
      "invalid license"
    );
    assert.strictEqual(
      utils.handleUndefinedAndNull(null),
      "invalid license"
    );
  });

  it("should return provided string primitive", () => {
    assert.strictEqual(
      utils.handleUndefinedAndNull("MIT"),
      "MIT"
    );
  });
});

function createDirent(name: string, isFile = true) {
  return {
    isFile: () => isFile,
    name
  } as Dirent;
}
