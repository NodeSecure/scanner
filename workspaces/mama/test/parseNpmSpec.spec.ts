// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { parseNpmSpec } from "../src/index.ts";

describe("parseNpmSpec", () => {
  test("should parse the simplest package spec", () => {
    assert.deepEqual(parseNpmSpec("foo"), {
      org: null,
      name: "foo",
      semver: null,
      spec: "foo"
    });
  });

  test("should be able to parse semver", () => {
    assert.deepEqual(parseNpmSpec("express@5.1.0"), {
      org: null,
      name: "express",
      semver: "5.1.0",
      spec: "express@5.1.0"
    });
  });

  test("should be able to parse the org", () => {
    assert.deepEqual(parseNpmSpec("@nodesecure/scanner"), {
      org: "nodesecure",
      name: "@nodesecure/scanner",
      semver: null,
      spec: "@nodesecure/scanner"
    });
  });

  test("should be able to parse a complete spec", () => {
    assert.deepEqual(parseNpmSpec("@nodesecure/scanner@latest"), {
      org: "nodesecure",
      name: "@nodesecure/scanner",
      semver: "latest",
      spec: "@nodesecure/scanner@latest"
    });
  });

  test("should not parse unvalid spec", () => {
    assert.equal(parseNpmSpec(""), null);
  });
});
