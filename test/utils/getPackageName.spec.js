// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getPackageName } from "../../src/utils/index.js";

describe("getPackageName", () => {
  it("getPackageName should return the package name (if there is not slash char at all)", () => {
    assert.deepStrictEqual(getPackageName("mocha"), "mocha");
  });

  it("getPackageName should return the package name (first part before '/' character)", () => {
    assert.deepStrictEqual(getPackageName("foo/bar"), "foo");
  });

  it("getPackageName should return the package name with organization namespace", () => {
    assert.deepStrictEqual(getPackageName("@slimio/is/test"), "@slimio/is");
  });
});
