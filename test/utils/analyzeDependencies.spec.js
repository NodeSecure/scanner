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
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });

  tape.end();
});
