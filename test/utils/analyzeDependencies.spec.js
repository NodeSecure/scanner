// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { analyzeDependencies } from "../../src/utils/index.js";

test("analyzeDependencies should detect Node.js dependencies and also flag hasExternalCapacity", (tape) => {
  const packageDeps = [];
  const packageDevDeps = [];

  const result = analyzeDependencies([
    "fs",
    "http"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  tape.deepEqual(result, {
    nodeDependencies: ["fs", "http"],
    thirdPartyDependencies: [],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: true, hasMissingOrUnusedDependency: false }
  });

  tape.end();
});

test("analyzeDependencies should detect prefixed (namespaced 'node:') core dependencies", (tape) => {
  const packageDeps = ["node:foobar"];
  const packageDevDeps = [];

  const result = analyzeDependencies([
    "node:fs",
    "node:test",
    "node:foobar"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  tape.deepEqual(result, {
    nodeDependencies: ["node:fs", "node:test"],
    thirdPartyDependencies: ["node:foobar"],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });

  tape.end();
});

test("analyzeDependencies should be capable of detecting unused dependency 'koa'", (tape) => {
  const packageDeps = ["koa", "kleur"];
  const packageDevDeps = ["mocha"];

  const result = analyzeDependencies([
    "mocha",
    "kleur"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  tape.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["kleur"],
    subpathImportsDependencies: [],
    unusedDependencies: ["koa"],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });

  tape.end();
});

test("analyzeDependencies should be capable of detecting unused dependency 'kleur'", (tape) => {
  const packageDeps = ["mocha"];
  const packageDevDeps = [];

  const result = analyzeDependencies([
    "mocha",
    "kleur"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  tape.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["mocha", "kleur"],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: ["kleur"],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });

  tape.end();
});

test("analyzeDependencies should ignore '@types' for third-party dependencies", (tape) => {
  const packageDeps = ["@types/npm"];
  const packageDevDeps = ["kleur"];

  const result = analyzeDependencies([
    "kleur"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set() });

  tape.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: [],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });

  tape.end();
});

test("analyzeDependencies should ignore file dependencies and try dependencies", (tape) => {
  const packageDeps = [];
  const packageDevDeps = ["kleur"];

  const result = analyzeDependencies([
    "kleur",
    "httpie",
    "./foobar.js"
  ], { packageDeps, packageDevDeps, tryDependencies: new Set(["httpie"]) });

  tape.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: [],
    subpathImportsDependencies: [],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });

  tape.end();
});

test("analyzeDependencies should detect Node.js subpath import and set relation between #dep and kleur.", (tape) => {
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

  tape.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["#dep"],
    subpathImportsDependencies: [
      ["#dep", "kleur"]
    ],
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });

  tape.end();
});

test("analyzeDependencies should detect Node.js subpath import (with a default property pointing to a file)", (tape) => {
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

  tape.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["#dep"],
    subpathImportsDependencies: [
      ["#dep", "./foo.js"]
    ],
    unusedDependencies: ["kleur"],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });

  tape.end();
});
