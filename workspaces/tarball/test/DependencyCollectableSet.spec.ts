// Import Node.js Dependencies
import path from "node:path";
import { test, describe } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import type { ManifestManager } from "@nodesecure/mama";

// Import Internal Dependencies
import { DependencyCollectableSet } from "../src/class/DependencyCollectableSet.class.ts";

type Manifest = Pick<ManifestManager, "dependencies" | "devDependencies" | "nodejsImports">;

describe("DependencyCollectableSet", () => {
  test("should have no dependencies initialy", () => {
    const mama: Manifest = {
      dependencies: [],
      devDependencies: [],
      nodejsImports: {}
    };

    const dependencyCollectableSet = new DependencyCollectableSet(mama);
    assert.deepEqual(dependencyCollectableSet.dependencies, {});
  });

  test("should group dependencies by file", () => {
    const mama: Manifest = {
      dependencies: [],
      devDependencies: [],
      nodejsImports: {}
    };

    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("fs", {
      file: ".",
      location: [[0, 0], [0, 0]],
      metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "file1.js"
      }
    });

    dependencyCollectableSet.add("http", {
      file: ".",
      location: [[0, 0], [0, 0]],
      metadata: {
        unsafe: false,
        inTry: true,
        relativeFile: "file2.js"
      }
    });

    dependencyCollectableSet.add("lodash.isequal", {
      file: ".",
      location: [[0, 0], [0, 0]],
      metadata: {
        unsafe: false,
        inTry: false,

        relativeFile: "file2.js"
      }
    });

    assert.deepEqual(dependencyCollectableSet.dependencies, {
      "file1.js": {
        fs: {
          unsafe: false,
          inTry: false,
          location: [[0, 0], [0, 0]]
        }
      },
      "file2.js": {
        http: {
          unsafe: false,
          inTry: true,
          location: [[0, 0], [0, 0]]
        },
        "lodash.isequal": {
          unsafe: false,
          inTry: false,
          location: [[0, 0], [0, 0]]
        }
      }
    });
  });

  test("should detect Node.js dependencies and also flag hasExternalCapacity", () => {
    const mama: Manifest = {
      dependencies: [],
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("fs", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet.add("http", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: true, hasMissingOrUnusedDependency: false },
      dependencies: {
        nodeJs: ["fs", "http"],
        thirdparty: [],
        subpathImports: {},
        unused: [],
        missing: []
      }
    });
  });

  test("should flag third parties dependencies with hasExternalCapacity", () => {
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
      const mama: Manifest = {
        dependencies: [externalThridPartyDep],
        devDependencies: [],
        nodejsImports: {}
      };

      const dependencyCollectableSet = new DependencyCollectableSet(mama);

      dependencyCollectableSet.add(externalThridPartyDep, {
        file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
          unsafe: false,
          inTry: false,
          relativeFile: process.cwd()
        }
      });

      assert.deepEqual(dependencyCollectableSet.extract(), {
        files: new Set([]),
        dependenciesInTryBlock: [],
        flags: { hasExternalCapacity: true, hasMissingOrUnusedDependency: false },
        dependencies: {
          nodeJs: [],
          thirdparty: [externalThridPartyDep],
          subpathImports: {},
          unused: [],
          missing: []
        }
      });
    }
  });

  test(`should detect no unused or missing dependencies
      and avoid confusion for package name with dots`, () => {
    const mama: Manifest = {
      dependencies: ["lodash.isequal"],
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("lodash.isequal", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false },
      dependencies: {
        nodeJs: [],
        thirdparty: ["lodash.isequal"],
        subpathImports: {},
        unused: [],
        missing: []
      }
    });
  });

  test("should detect prefixed (namespaced 'node:') core dependencies", () => {
    const mama: Manifest = {
      dependencies: ["node:foo"],
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("node:fs", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet.add("node:foo", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet.add("node:bar", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true },
      dependencies: {
        nodeJs: ["node:fs"],
        thirdparty: ["node:foo", "node:bar"],
        subpathImports: {},
        unused: [],
        missing: ["node:bar"]
      }
    });
  });

  test("should be capable of detecting unused dependency 'koa'", () => {
    const mama: Manifest = {
      dependencies: ["koa", "kleur"],
      devDependencies: ["mocha"],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("mocha", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet.add("kleur", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true },
      dependencies: {
        nodeJs: [],
        thirdparty: ["kleur"],
        subpathImports: {},
        unused: ["koa"],
        missing: []
      }
    });
  });

  test("should not detect unused dependencies on deep import", () => {
    const mama: Manifest = {
      dependencies: ["koa", "kleur"],
      devDependencies: ["mocha"],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("mocha", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet.add("kleur", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet.add("koa/dist/index.js", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false },
      dependencies: {
        nodeJs: [],
        thirdparty: ["kleur", "koa"],
        subpathImports: {},
        unused: [],
        missing: []
      }
    });
  });

  test("should be capable of detecting missing dependency 'kleur'", () => {
    const mama: Manifest = {
      dependencies: ["mocha"],
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("mocha", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet.add("kleur", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true },
      dependencies: {
        nodeJs: [],
        thirdparty: ["mocha", "kleur"],
        subpathImports: {},
        unused: [],
        missing: ["kleur"]
      }
    });
  });

  test("should ignore '@types' for third-party dependencies", () => {
    const mama: Manifest = {
      dependencies: ["@types/npm"],
      devDependencies: ["kleur"],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("kleur", {
      file: ".", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "."
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false },
      dependencies: {
        nodeJs: [],
        thirdparty: [],
        subpathImports: {},
        unused: [],
        missing: []
      }
    });
  });

  test("should ignore file dependencies and try dependencies", () => {
    const mama: Manifest = {
      dependencies: [],
      devDependencies: ["kleur"],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("kleur", {
      file: ".", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "."
      }
    });

    dependencyCollectableSet.add("httpie", {
      file: ".", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: true,
        relativeFile: "."
      }
    });

    dependencyCollectableSet.add("./foobar.js", {
      file: ".", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "."
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set(["foobar.js"]),
      dependenciesInTryBlock: ["httpie"],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false },
      dependencies: {
        nodeJs: [],
        thirdparty: [],
        subpathImports: {},
        unused: [],
        missing: []
      }
    });
  });

  test("should detect Node.js subpath import and set relation between #dep and kleur", () => {
    const mama = {
      dependencies: ["kleur"],
      devDependencies: [],
      nodejsImports: {
        "#dep": {
          node: "kleur"
        }
      }
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("#dep", {
      file: ".", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "."
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: false },
      dependencies: {
        nodeJs: [],
        thirdparty: ["#dep"],
        subpathImports: {
          "#dep": "kleur"
        },
        unused: [],
        missing: []
      }
    });
  });

  test("should detect Node.js subpath import (with a default property pointing to a file)", () => {
    const mama = {
      dependencies: ["kleur"],
      devDependencies: [],
      nodejsImports: {
        "#dep": {
          default: "./foo.js"
        }
      }
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("#dep", {
      file: ".", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "."
      }
    });

    assert.deepEqual(dependencyCollectableSet.extract(), {
      files: new Set([]),
      dependenciesInTryBlock: [],
      flags: { hasExternalCapacity: false, hasMissingOrUnusedDependency: true },
      dependencies: {
        nodeJs: [],
        thirdparty: ["#dep"],
        subpathImports: {
          "#dep": "./foo.js"
        },
        unused: ["kleur"],
        missing: []
      }
    });
  });

  test("get all the dependencies name", () => {
    const mama: Manifest = {
      dependencies: [],
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("fs", {
      file: ".", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "."
      }
    });

    dependencyCollectableSet.add("http", {
      file: ".", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "."
      }
    });

    assert.deepEqual([...dependencyCollectableSet.values()], ["fs", "http"]);
  });

  test("should be able to match all relative import path", () => {
    const mama: Manifest = {
      dependencies: [],
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet1 = new DependencyCollectableSet(mama);
    const dependencyCollectableSet2 = new DependencyCollectableSet(mama);

    dependencyCollectableSet1.add(".", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet2.add("./", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet1.add("..", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    dependencyCollectableSet2.add("../", {
      file: process.cwd(), location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: process.cwd()
      }
    });

    assert.deepEqual([...dependencyCollectableSet1.extract().files], [
      "index.js",
      "..\\index.js"
    ].map((location) => location.replaceAll("\\", path.sep)));
    assert.deepEqual([...dependencyCollectableSet2.extract().files], [
      "index.js",
      "..\\index.js"
    ].map((location) => location.replaceAll("\\", path.sep)));
  });

  test("should be able to match a file and join with the relative path", () => {
    const mama: Manifest = {
      dependencies: [],
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("./foobar.js", {
      file: process.cwd(),
      location: [[0, 0], [0, 0]],
      metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "src/entry.js"
      }
    });

    assert.deepEqual([...dependencyCollectableSet.extract().files], [
      path.join("src", "foobar.js")
    ]);
  });
  test("should be able to automatically append the '.js' extension", () => {
    const mama: Manifest = {
      dependencies: [],
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("./foobar", {
      file: process.cwd(),
      location: [[0, 0], [0, 0]],
      metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "src/entry.js"
      }
    });
    assert.deepEqual([...dependencyCollectableSet.extract().files], [
      path.join("src", "foobar.js")
    ]);
  });

  test("should detect all required dependencies (node, files, third-party)", () => {
    const thirdpartyDependencies = ["mocha", "yolo"];
    const mama: Manifest = {
      dependencies: thirdpartyDependencies,
      devDependencies: [],
      nodejsImports: {}
    };
    const dependencyCollectableSet = new DependencyCollectableSet(mama);

    dependencyCollectableSet.add("./src/foo.js", {
      file: "one", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "one/index.js"
      }
    });

    dependencyCollectableSet.add("http", {
      file: "one", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "one/index.js"
      }
    });

    dependencyCollectableSet.add("mocha", {
      file: "one", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "one/index.js"
      }
    });

    dependencyCollectableSet.add("/home/marco", {
      file: "one", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "one/index.js"
      }
    });

    dependencyCollectableSet.add("yolo", {
      file: "one", location: [[0, 0], [0, 0]], metadata: {
        unsafe: false,
        inTry: false,
        relativeFile: "one/index.js"
      }
    });

    const { files, dependencies, flags } = dependencyCollectableSet.extract();

    assert.deepEqual(
      normalize(files),
      normalize([
        "one/src/foo.js",
        "one/home/marco.js"
      ])
    );
    assert.deepEqual(dependencies, {
      nodeJs: ["http"],
      subpathImports: {},
      thirdparty: thirdpartyDependencies,
      missing: [],
      unused: []
    });
    assert.deepEqual(flags, {
      hasExternalCapacity: true,
      hasMissingOrUnusedDependency: false
    });
  });
});

function normalize(values: Iterable<string>): string[] {
  return Array.from(values)
    .map((value) => path.normalize(value))
    .sort();
}
