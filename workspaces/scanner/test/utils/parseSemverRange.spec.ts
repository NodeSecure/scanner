// Import Node.js Dependencies
import { test, describe } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { parseSemverRange } from "../../src/utils/parseSemverRange.ts";

describe("parseSemverRange", () => {
  test("should do nothing when the semver ranges are already well formatted", () => {
    assert.deepEqual(parseSemverRange({
      foo: "1.2.3",
      bar: "1.2.3 || 1.2.4"
    }), {
      foo: "1.2.3",
      bar: "1.2.3 || 1.2.4"
    });
  });

  test("should parse to semver range string when getting an array", () => {
    assert.deepEqual(parseSemverRange({
      foo: ["1.2.3"],
      bar: ["1.2.3", "1.2.4"]
    }), {
      foo: "1.2.3",
      bar: "1.2.3 || 1.2.4"
    });
  });

  describe("specs", () => {
    test("should parse specs to name semver range", () => {
      assert.deepEqual(parseSemverRange(["foo@1.2.3", "bar@1.2.3", "bar@1.2.4"]), {
        foo: "1.2.3",
        bar: "1.2.3 || 1.2.4"
      });
    });

    test("should parse to wildcard when there is no version", () => {
      assert.deepEqual(parseSemverRange(["mocha", "jest@1.2.1", "jest"]), {
        mocha: "*",
        jest: "1.2.1 || *"
      });
    });

    test("should include the org in the name", () => {
      assert.deepEqual(parseSemverRange(["@nodesecure/js-x-ray@1.0.0", "@nodesecure/js-x-ray@1.0.1"]), {
        "@nodesecure/js-x-ray": "1.0.0 || 1.0.1"
      });
    });

    test("should should not parse invalid specs", () => {
      assert.deepEqual(parseSemverRange([""]), {});
    });
  });
});
