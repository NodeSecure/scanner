// Require Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { analyzeDependencies } from "../../src/utils/index.js";

test("analyzeDependencies should detect Node.js dependencies and also flag hasExternalCapacity", () => {
  const packageDeps = [];
  const packageDevDeps = [];

  const result = analyzeDependencies([
    "fs",
    "http"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: ["fs", "http"],
    thirdPartyDependencies: [],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: true, hasMissingOrUnusedDependency: false }
  });
});

test("analyzeDependencies should detect prefixed (namespaced 'node:') core dependencies", () => {
  const packageDeps = ["node:foo"];
  const packageDevDeps = [];

  const result = analyzeDependencies([
    "node:fs",
    "node:foo",
    "node:bar"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: ["node:fs"],
    thirdPartyDependencies: ["node:foo", "node:bar"],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: ["node:bar"],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });
});

test("analyzeDependencies should be capable of detecting unused dependency 'koa'", () => {
  const packageDeps = ["koa", "kleur"];
  const packageDevDeps = ["mocha"];

  const result = analyzeDependencies([
    "mocha",
    "kleur"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["kleur"],
    subpathImportsDependencies: [],
    unusedDependencies: ["koa"],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });
});

test("analyzeDependencies should be capable of detecting unused dependency 'kleur'", () => {
  const packageDeps = ["mocha"];
  const packageDevDeps = [];

  const result = analyzeDependencies([
    "mocha",
    "kleur"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["mocha", "kleur"],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: ["kleur"],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });
});

test("analyzeDependencies should ignore '@types' for third-party dependencies", () => {
  const packageDeps = ["@types/npm"];
  const packageDevDeps = ["kleur"];

  const result = analyzeDependencies([
    "kleur"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: [],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });
});

test("analyzeDependencies should ignore file dependencies and try dependencies", () => {
  const packageDeps = [];
  const packageDevDeps = ["kleur"];

  const result = analyzeDependencies([
    "kleur",
    "httpie",
    "./foobar.js"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set(["httpie"]) });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: [],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });
});

test("analyzeDependencies should detect Node.js subpath import and set relation between #dep and kleur.", () => {
  const packageDeps = ["kleur"];
  const packageDevDeps = [];
  const nodeImports = {
    "#dep": {
      node: "kleur"
    }
  };

  const result = analyzeDependencies([
    "#dep"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set(), nodeImports });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["#dep"],
    subpathImportsDependencies: [
      ["#dep", "kleur"]
    ],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });
});

test("analyzeDependencies should detect Node.js subpath import (with a default property pointing to a file)", () => {
  const packageDeps = ["kleur"];
  const packageDevDeps = [];
  const nodeImports = {
    "#dep": {
      default: "./foo.js"
    }
  };

  const result = analyzeDependencies([
    "#dep"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set(), nodeImports });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["#dep"],
    subpathImportsDependencies: [
      ["#dep", "./foo.js"]
    ],
    unusedDependencies: ["kleur"],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });
});
