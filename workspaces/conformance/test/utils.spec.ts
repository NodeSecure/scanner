// Import Node.js Dependencies
import { describe, it, test } from "node:test";
import { Dirent } from "node:fs";
import assert from "node:assert";

// Import Internal Dependencies
import * as utils from "../src/utils/index.ts";

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

function createDirent(name: string, isFile = true) {
  return {
    isFile: () => isFile,
    name
  } as Dirent;
}
