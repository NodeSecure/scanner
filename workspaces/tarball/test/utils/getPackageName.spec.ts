// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getPackageName, parsePackageSpec } from "../../src/utils/index.js";

// Test parsePackageSpec function (full parsing)
test("parsePackageSpec should parse simple package name", () => {
  const result = parsePackageSpec("express");
  assert.deepStrictEqual(result, {
    org: null,
    name: "express",
    semver: null,
    spec: "express"
  });
});

test("parsePackageSpec should parse package name with version", () => {
  const result = parsePackageSpec("express@4.18.2");
  assert.deepStrictEqual(result, {
    org: null,
    name: "express",
    semver: "4.18.2",
    spec: "express@4.18.2"
  });
});

test("parsePackageSpec should parse scoped package name", () => {
  const result = parsePackageSpec("@nodesecure/scanner");
  assert.deepStrictEqual(result, {
    org: "nodesecure",
    name: "@nodesecure/scanner",
    semver: null,
    spec: "@nodesecure/scanner"
  });
});

test("parsePackageSpec should parse scoped package with path", () => {
  const result = parsePackageSpec("@slimio/is/test");
  assert.deepStrictEqual(result, {
    org: "slimio",
    name: "@slimio/is",
    semver: null,
    spec: "@slimio/is/test"
  });
});

test("parsePackageSpec should parse scoped package with version", () => {
  const result = parsePackageSpec("@nodesecure/scanner@1.2.3");
  assert.deepStrictEqual(result, {
    org: "nodesecure",
    name: "@nodesecure/scanner",
    semver: "1.2.3",
    spec: "@nodesecure/scanner@1.2.3"
  });
});

test("parsePackageSpec should parse scoped package with prerelease version", () => {
  const result = parsePackageSpec("@babel/core@7.22.0-beta.1");
  assert.deepStrictEqual(result, {
    org: "babel",
    name: "@babel/core",
    semver: "7.22.0-beta.1",
    spec: "@babel/core@7.22.0-beta.1"
  });
});

test("parsePackageSpec should handle package name with multiple @ symbols", () => {
  const result = parsePackageSpec("@org/package@1.0.0@latest");
  assert.deepStrictEqual(result, {
    org: "org",
    name: "@org/package",
    semver: "1.0.0@latest",
    spec: "@org/package@1.0.0@latest"
  });
});

test("parsePackageSpec should handle package with path and version", () => {
  const result = parsePackageSpec("express/lib@4.18.2");
  assert.deepStrictEqual(result, {
    org: null,
    name: "express",
    semver: "4.18.2",
    spec: "express/lib@4.18.2"
  });
});

// Test getPackageName function (backward compatibility - returns string)
test("getPackageName should return simple package name", () => {
  assert.strictEqual(getPackageName("express"), "express");
});

test("getPackageName should return package name without version", () => {
  assert.strictEqual(getPackageName("express@4.18.2"), "express");
});

test("getPackageName should return scoped package name", () => {
  assert.strictEqual(getPackageName("@nodesecure/scanner"), "@nodesecure/scanner");
});

test("getPackageName should return scoped package name with path", () => {
  assert.strictEqual(getPackageName("@slimio/is/test"), "@slimio/is");
});

test("getPackageName should return scoped package name without version", () => {
  assert.strictEqual(getPackageName("@nodesecure/scanner@1.2.3"), "@nodesecure/scanner");
});

test("getPackageName should return package name from path with version", () => {
  assert.strictEqual(getPackageName("express/lib@4.18.2"), "express");
});

// Legacy test compatibility
test("getPackageName should return the package name (if there is not slash char at all)", () => {
  assert.strictEqual(getPackageName("mocha"), "mocha");
});

test("getPackageName should return the package name (first part before '/' character)", () => {
  assert.strictEqual(getPackageName("foo/bar"), "foo");
});

test("getPackageName should return the package name with organization namespace", () => {
  assert.strictEqual(getPackageName("@slimio/is/test"), "@slimio/is");
});

// Test cases specifically from GitHub issue #419
test("Issue #419: parsePackageSpec should handle 'foo'", () => {
  const result = parsePackageSpec("foo");
  assert.deepStrictEqual(result, {
    org: null,
    name: "foo",
    semver: null,
    spec: "foo"
  });
});

test("Issue #419: parsePackageSpec should handle '@nodesecure/scanner'", () => {
  const result = parsePackageSpec("@nodesecure/scanner");
  assert.deepStrictEqual(result, {
    org: "nodesecure",
    name: "@nodesecure/scanner",
    semver: null,
    spec: "@nodesecure/scanner"
  });
});

test("Issue #419: parsePackageSpec should handle 'express@5.1.0'", () => {
  const result = parsePackageSpec("express@5.1.0");
  assert.deepStrictEqual(result, {
    org: null,
    name: "express",
    semver: "5.1.0",
    spec: "express@5.1.0"
  });
});

// Additional comprehensive test cases for better coverage
test("parsePackageSpec should handle complex semver versions", () => {
  const result = parsePackageSpec("@types/node@18.15.11");
  assert.deepStrictEqual(result, {
    org: "types",
    name: "@types/node",
    semver: "18.15.11",
    spec: "@types/node@18.15.11"
  });
});

test("parsePackageSpec should handle semver with build metadata", () => {
  const result = parsePackageSpec("@org/package@1.0.0-alpha.1+build.1");
  assert.deepStrictEqual(result, {
    org: "org",
    name: "@org/package",
    semver: "1.0.0-alpha.1+build.1",
    spec: "@org/package@1.0.0-alpha.1+build.1"
  });
});

test("parsePackageSpec should handle npm tags", () => {
  const result = parsePackageSpec("react@latest");
  assert.deepStrictEqual(result, {
    org: null,
    name: "react",
    semver: "latest",
    spec: "react@latest"
  });
});

test("parsePackageSpec should handle scoped package with npm tag", () => {
  const result = parsePackageSpec("@babel/core@next");
  assert.deepStrictEqual(result, {
    org: "babel",
    name: "@babel/core",
    semver: "next",
    spec: "@babel/core@next"
  });
});

test("parsePackageSpec should handle empty string gracefully", () => {
  const result = parsePackageSpec("");
  assert.deepStrictEqual(result, {
    org: null,
    name: "",
    semver: null,
    spec: ""
  });
});

test("parsePackageSpec should handle package names with numbers", () => {
  const result = parsePackageSpec("@angular/core@15.2.9");
  assert.deepStrictEqual(result, {
    org: "angular",
    name: "@angular/core",
    semver: "15.2.9",
    spec: "@angular/core@15.2.9"
  });
});

test("parsePackageSpec should handle package names with hyphens", () => {
  const result = parsePackageSpec("@my-org/my-package@1.0.0-rc.1");
  assert.deepStrictEqual(result, {
    org: "my-org",
    name: "@my-org/my-package",
    semver: "1.0.0-rc.1",
    spec: "@my-org/my-package@1.0.0-rc.1"
  });
});

// Input validation tests
test("parsePackageSpec should throw TypeError for non-string input", () => {
  assert.throws(() => {
    // @ts-expect-error - Testing runtime type checking
    parsePackageSpec(null);
  }, TypeError, 'Package specification must be a string');
  
  assert.throws(() => {
    // @ts-expect-error - Testing runtime type checking
    parsePackageSpec(undefined);
  }, TypeError, 'Package specification must be a string');
  
  assert.throws(() => {
    // @ts-expect-error - Testing runtime type checking
    parsePackageSpec(123);
  }, TypeError, 'Package specification must be a string');
});
