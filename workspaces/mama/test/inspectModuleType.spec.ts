// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import type {
  PackageJSON
} from "@nodesecure/npm-types";

// Import Internal Dependencies
import { inspectModuleType } from "../src/utils/index.js";

// CONSTANTS
const kMinimalPackageJSON = {
  name: "foobar",
  version: "1.0.0"
} as const;

describe("inspectModuleType", () => {
  test("package with the absolute minimal properties must return 'cjs' by default", () => {
    assert.strictEqual(
      inspectModuleType(kMinimalPackageJSON),
      "cjs"
    );
  });

  test("package name starting with @types should be detected as dts", () => {
    const packageJSON: PackageJSON = {
      ...kMinimalPackageJSON,
      name: "@types/foobar"
    };

    assert.strictEqual(
      inspectModuleType(packageJSON),
      "dts"
    );
  });

  test("package with absolutely no exports defined but types is should return 'dts'", () => {
    const packageJSON: PackageJSON = {
      ...kMinimalPackageJSON,
      types: "./index.d.ts"
    };

    assert.strictEqual(
      inspectModuleType(packageJSON),
      "dts"
    );
  });

  test("package with type equal 'commonjs' should return 'cjs'", () => {
    const packageJSON: PackageJSON = {
      ...kMinimalPackageJSON,
      type: "commonjs"
    };

    assert.strictEqual(
      inspectModuleType(packageJSON),
      "cjs"
    );
  });

  test("package with type equal 'module' should return 'esm'", () => {
    const packageJSON: PackageJSON = {
      ...kMinimalPackageJSON,
      type: "module"
    };

    assert.strictEqual(
      inspectModuleType(packageJSON),
      "esm"
    );
  });

  test("package with a main containing a .mjs file should return 'esm'", () => {
    const packageJSON: PackageJSON = {
      ...kMinimalPackageJSON,
      main: "./index.mjs"
    };

    assert.strictEqual(
      inspectModuleType(packageJSON),
      "esm"
    );
  });

  test("package with a main not containing .mjs file should return cjs", () => {
    const packageJSON: PackageJSON = {
      ...kMinimalPackageJSON,
      main: "./index.js"
    };

    assert.strictEqual(
      inspectModuleType(packageJSON),
      "cjs"
    );
  });

  test("package with legacy module property set should return 'faux'", () => {
    const packageJSON: PackageJSON = {
      ...kMinimalPackageJSON,
      module: true
    };

    assert.strictEqual(
      inspectModuleType(packageJSON),
      "faux"
    );
  });

  test("package with dual CJS & ESM exports must return 'dual'", () => {
    const packageJSON: PackageJSON = {
      ...kMinimalPackageJSON,
      exports: {
        ".": {
          require: "./dist/index.cjs",
          import: "./dist/index.js"
        }
      }
    };

    assert.strictEqual(
      inspectModuleType(packageJSON),
      "dual"
    );
  });
});
