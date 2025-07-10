// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { analyzeDependencies } from "../../src/utils/index.js";

test("analyzeDependencies should detect Node.js dependencies and also flag hasExternalCapacity", () => {
  const mama = {
    dependencies: [],
    devDependencies: []
  };

  const result = analyzeDependencies([
    "fs",
    "http"
  ], { mama, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: ["fs", "http"],
    thirdPartyDependencies: [],
    subpathImportsDependencies: {},
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: true, hasMissingOrUnusedDependency: false }
  });
});

test("analyzeDependencies should flag third parties dependencies with hasExternalCapacity", () => {
  const externalThridPartyDeps = ["undici",
    "node-fetch",
    "execa",
    "cross-spawn",
    "got",
    "axios",
    "axios",
    "ky",
    "superagent",
    "cross-fetch"
  ];

  for (const externalThridPartyDep of externalThridPartyDeps) {
    const mama = {
      dependencies: [externalThridPartyDep],
      devDependencies: []
    };

    const result = analyzeDependencies([
      externalThridPartyDep
    ], { mama, tryDependencies: new Set() });

    assert.deepEqual(result, {
      nodeDependencies: [],
      thirdPartyDependencies: [externalThridPartyDep],
      subpathImportsDependencies: {},
      unusedDependencies: [],
      missingDependencies: [],
      flags: { hasExternalCapacity: true, hasMissingOrUnusedDependency: false }
    });
  }
});

test("analyzeDependencies should detect no unused or missing dependencies and avoid confusion for package name with dots", () => {
  const mama = {
    dependencies: ["lodash.isequal"],
    devDependencies: []
  };

  const result = analyzeDependencies(["lodash.isequal"], {
    mama,
    tryDependencies: new Set()
  });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["lodash.isequal"],
    subpathImportsDependencies: {},
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });
});

test("analyzeDependencies should detect prefixed (namespaced 'node:') core dependencies", () => {
  const mama = {
    dependencies: ["node:foo"],
    devDependencies: []
  };

  const result = analyzeDependencies([
    "node:fs",
    "node:foo",
    "node:bar"
  ], { mama, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: ["node:fs"],
    thirdPartyDependencies: ["node:foo", "node:bar"],
    subpathImportsDependencies: {},
    unusedDependencies: [],
    missingDependencies: ["node:bar"],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });
});

test("analyzeDependencies should be capable of detecting unused dependency 'koa'", () => {
  const mama = {
    dependencies: ["koa", "kleur"],
    devDependencies: ["mocha"]
  };

  const result = analyzeDependencies([
    "mocha",
    "kleur"
  ], { mama, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["kleur"],
    subpathImportsDependencies: {},
    unusedDependencies: ["koa"],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });
});

test("analyzeDependencies should be capable of detecting unused dependency 'kleur'", () => {
  const mama = {
    dependencies: ["mocha"],
    devDependencies: []
  };

  const result = analyzeDependencies([
    "mocha",
    "kleur"
  ], { mama, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["mocha", "kleur"],
    subpathImportsDependencies: {},
    unusedDependencies: [],
    missingDependencies: ["kleur"],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true }
  });
});

test("analyzeDependencies should ignore '@types' for third-party dependencies", () => {
  const mama = {
    dependencies: ["@types/npm"],
    devDependencies: ["kleur"]
  };

  const result = analyzeDependencies([
    "kleur"
  ], { mama, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: [],
    subpathImportsDependencies: {},
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });
});

test("analyzeDependencies should ignore file dependencies and try dependencies", () => {
  const mama = {
    dependencies: [],
    devDependencies: ["kleur"]
  };

  const result = analyzeDependencies([
    "kleur",
    "httpie",
    "./foobar.js"
  ], { mama, tryDependencies: new Set(["httpie"]) });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: [],
    subpathImportsDependencies: {},
    unusedDependencies: [],
    missingDependencies: [],
    flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false }
  });
});

test("analyzeDependencies should detect Node.js subpath import and set relation between #dep and kleur.", () => {
  const mama = {
    dependencies: ["kleur"],
    devDependencies: [],
    nodejsImports: {
      "#dep": {
        node: "kleur"
      }
    }
  };

  const result = analyzeDependencies([
    "#dep"
  ], { mama, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["#dep"],
    subpathImportsDependencies: {
      "#dep": "kleur"
    },
    unusedDependencies: [],
    missingDependencies: [],
    flags: {
      hasExternalCapacity: false,
      hasMissingOrUnusedDependency: false
    }
  });
});

test("analyzeDependencies should detect Node.js subpath import (with a default property pointing to a file)", () => {
  const mama = {
    dependencies: ["kleur"],
    devDependencies: [],
    nodejsImports: {
      "#dep": {
        default: "./foo.js"
      }
    }
  };

  const result = analyzeDependencies([
    "#dep"
  ], { mama, tryDependencies: new Set() });

  assert.deepEqual(result, {
    nodeDependencies: [],
    thirdPartyDependencies: ["#dep"],
    subpathImportsDependencies: {
      "#dep": "./foo.js"
    },
    unusedDependencies: ["kleur"],
    missingDependencies: [],
    flags: {
      hasExternalCapacity: false,
      hasMissingOrUnusedDependency: true
    }
  });
});
