// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import {
  parseSemverRange
} from "../../src/utils/parseSemverRange.ts";

describe("utils.parseSemverRange", () => {
  it("should do nothing when the semver ranges are already well formatted", () => {
    assert.deepEqual(parseSemverRange({
      foo: "1.2.3",
      bar: "1.2.3 || 1.2.4"
    }), {
      foo: "1.2.3",
      bar: "1.2.3 || 1.2.4"
    });
  });

  it("should parse to semver range string when getting an array", () => {
    assert.deepEqual(parseSemverRange({
      foo: ["1.2.3"],
      bar: ["1.2.3", "1.2.4"]
    }), {
      foo: "1.2.3",
      bar: "1.2.3 || 1.2.4"
    });
  });

  describe("specs", () => {
    it("should parse specs to name semver range", () => {
      assert.deepEqual(parseSemverRange(["foo@1.2.3", "bar@1.2.3", "bar@1.2.4"]), {
        foo: "1.2.3",
        bar: "1.2.3 || 1.2.4"
      });
    });

    it("should parse to wildcard when there is no version", () => {
      assert.deepEqual(parseSemverRange(["mocha", "jest@1.2.1", "jest"]), {
        mocha: "*",
        jest: "1.2.1 || *"
      });
    });

    it("should include the org in the name", () => {
      assert.deepEqual(parseSemverRange(["@nodesecure/js-x-ray@1.0.0", "@nodesecure/js-x-ray@1.0.1"]), {
        "@nodesecure/js-x-ray": "1.0.0 || 1.0.1"
      });
    });

    it("should not parse invalid specs", () => {
      assert.deepEqual(parseSemverRange([""]), {});
    });

    it("should parse scope-only entries as wildcards", () => {
      assert.deepEqual(parseSemverRange(["@nodesecure"]), {
        "@nodesecure": "*"
      });
    });

    it("should parse scope-only entries alongside regular specs", () => {
      assert.deepEqual(parseSemverRange(["@nodesecure", "foo@1.0.0"]), {
        "@nodesecure": "*",
        foo: "1.0.0"
      });
    });
  });
});
