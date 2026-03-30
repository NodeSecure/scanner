// Import Node.js Dependencies
import { describe, it, test } from "node:test";
import { pathToFileURL } from "node:url";
import assert from "node:assert";
import path from "node:path";

// Import Third-party Dependencies
import pacote from "pacote";
import { ManifestManager } from "@nodesecure/mama";
import type {
  PackageJSON,
  WorkspacesPackageJSON
} from "@nodesecure/npm-types";

// Import Internal Dependencies
import {
  npm,
  type DependencyJSON
} from "../../src/index.ts";

// CONSTANTS
const kFixturesDir = path.join(import.meta.dirname, "..", "fixtures");

describe("npm.TreeWalker", () => {
  test("Given a fixed '@nodesecure/fs-walk' manifest then it must extract one root dependency", async() => {
    const spec = "@nodesecure/fs-walk@2.0.0";
    const manifest = await pacote.manifest(spec);
    const mama = new ManifestManager(manifest);
    const expectedIntegrity = manifest._integrity;

    const walker = new npm.TreeWalker();

    for await (const dependency of walker.walk(mama)) {
      assert.deepEqual(
        dependency,
        {
          id: 0,
          type: "cjs",
          name: "@nodesecure/fs-walk",
          version: "2.0.0",
          usedBy: {},
          isDevDependency: false,
          existOnRemoteRegistry: true,
          flags: [],
          warnings: [],
          dependencyCount: 0,
          gitUrl: null,
          alias: {},
          integrity: expectedIntegrity
        }
      );
    }
  });

  test(`Given a manifest with only one dependency and a mocked pacote.manifest function that throw an Error
    then it's must set existOnRemoteRegistry to false on the root dependency`, async(t) => {
    const spec = "@nodesecure/fs-walk@2.0.0";
    const manifest = await pacote.manifest(spec);
    const mama = new ManifestManager(manifest);

    const mockedPacoteProvider = {
      manifest: t.mock.fn(async function mock() {
        throw new Error("oh no!");
      })
    };
    const walker = new npm.TreeWalker({
      providers: {
        pacote: mockedPacoteProvider as any
      }
    });

    for await (const dependency of walker.walk(mama)) {
      assert.deepEqual(
        dependency,
        {
          id: 0,
          type: "cjs",
          name: "@nodesecure/fs-walk",
          version: "2.0.0",
          usedBy: {},
          isDevDependency: false,
          existOnRemoteRegistry: false,
          flags: [],
          warnings: [],
          dependencyCount: 0,
          gitUrl: null,
          alias: {},
          integrity: null
        }
      );
    }
  });

  test(`Given a fixed 'fastify' manifest and maxDepth option equal to one then
    it must return only the package direct dependencies`, async() => {
    const spec = "fastify@4.28.1";
    const manifest = await pacote.manifest(spec);
    const mama = new ManifestManager(manifest);

    const walker = new npm.TreeWalker();

    const dependencies: DependencyJSON[] = [];
    for await (const dependency of walker.walk(mama, { maxDepth: 1 })) {
      dependencies.push(dependency);
    }

    const rootDependency = dependencies.at(-1)!;
    assert.strictEqual(
      rootDependency.id,
      0
    );

    const names = dependencies
      .map((dependency) => dependency.name)
      .sort();
    assert.strictEqual(
      names.length,
      rootDependency.dependencyCount + 1
    );
    assert.deepEqual(
      names,
      [
        "@fastify/ajv-compiler",
        "@fastify/error",
        "@fastify/fast-json-stringify-compiler",
        "abstract-logging",
        "avvio",
        "fast-content-type-parse",
        "fast-json-stringify",
        "fastify",
        "find-my-way",
        "light-my-request",
        "pino",
        "process-warning",
        "proxy-addr",
        "rfdc",
        "secure-json-parse",
        "semver",
        "toad-cache"
      ]
    );

    assert.strictEqual(
      walker.relationsMap.size,
      0
    );
  });

  test(`Given the local scanner workspace as Manifest with maxDepth: 1
    it must return all workspaces as Dependency and complete the manifest name and version with default values`, async() => {
    const manifestLocation = path.join(import.meta.dirname, "..", "..", "..", "..", "package.json");

    const manifest = (
      await import(pathToFileURL(manifestLocation).href, { with: { type: "json" } })
    ).default as WorkspacesPackageJSON;
    const mama = new ManifestManager(manifest);
    const manifestWorkspaces = manifest.workspaces.map(
      (name) => "@nodesecure" + name.slice("workspaces".length)
    );

    const walker = new npm.TreeWalker();

    const dependencies: DependencyJSON[] = [];
    const walkOptions: npm.WalkOptions = {
      maxDepth: 1,
      packageLock: {
        location: path.dirname(manifestLocation),
        fetchManifest: false
      }
    };
    for await (const dependency of walker.walk(mama, walkOptions)) {
      dependencies.push(dependency);
    }

    const rootDependency = dependencies.at(-1)!;
    assert.strictEqual(
      rootDependency.name,
      "workspace"
    );
    assert.strictEqual(
      rootDependency.version,
      "1.0.0"
    );

    const names = dependencies
      .map((dependency) => dependency.name)
      .sort(sortByName);
    assert.deepEqual(
      names,
      [
        ...manifestWorkspaces,
        // Note: there is a BUG with arborist including 'typescript' as a workspace dependency
        // Test will break when the BUG will be fixed
        "typescript",
        "workspace"
      ].sort(sortByName)
    );
  });

  test(`Given a directory with only package.json wihout package-lock.json or node_modules
    it must not throw an error and fallback as a remote scanning`, async() => {
    const manifestLocation = path.join(kFixturesDir, "no-local-virtual", "package.json");

    const manifest = (
      await import(pathToFileURL(manifestLocation).href, { with: { type: "json" } })
    ).default as PackageJSON;
    const mama = new ManifestManager(manifest);

    const walker = new npm.TreeWalker();
    const walkOptions: npm.WalkOptions = {
      maxDepth: 1,
      packageLock: {
        location: path.dirname(manifestLocation),
        fetchManifest: false
      }
    };

    const dependencies: DependencyJSON[] = [];
    for await (const dependency of walker.walk(mama, walkOptions)) {
      dependencies.push(dependency);
    }

    const rootDependency = dependencies.at(-1)!;
    assert.strictEqual(
      rootDependency.name,
      "non-npm-package"
    );
    assert.strictEqual(
      rootDependency.version,
      "1.0.0"
    );
    assert.strictEqual(dependencies.length, 1);
  });

  describe("relationsMaps", () => {
    it("should always be cleared when triggering walk() and return an empty Map if the package has no dependencies", async() => {
      const manifest = await pacote.manifest(
        "@nodesecure/fs-walk@2.0.0"
      );

      const mama = new ManifestManager(manifest);
      const walker = new npm.TreeWalker();
      walker.relationsMap.set("foo@1.5.0", new Set());

      for await (const _ of walker.walk(mama)) {
        // do nothing
      }

      assert.strictEqual(
        walker.relationsMap.size,
        0
      );
    });
  });

  describe("error resilience", () => {
    test(`Given a manifest with transitive dependencies and a mocked pacote that fails on transitive fetches
      it should gracefully skip the failing dependencies and still yield the root`, async(t) => {
      const rootManifest = {
        name: "test-pkg",
        version: "1.0.0",
        dependencies: {
          "dep-a": "^1.0.0",
          "dep-b": "^2.0.0"
        }
      };

      let callCount = 0;
      const mockedPacoteProvider = {
        manifest: t.mock.fn(async(_: string) => {
          callCount++;
          // First call is for root integrity check, let it fail (existOnRemoteRegistry = false)
          if (callCount === 1) {
            throw new Error("root not found");
          }
          // Transitive dependency fetches all fail (simulating registry 403)
          throw new Error("403 Forbidden");
        }),
        packument: t.mock.fn(async() => {
          throw new Error("403 Forbidden");
        })
      };

      const walker = new npm.TreeWalker({
        providers: {
          pacote: mockedPacoteProvider
        }
      });

      const mama = new ManifestManager(rootManifest);
      const dependencies: DependencyJSON[] = [];
      for await (const dependency of walker.walk(mama, { maxDepth: 10 })) {
        dependencies.push(dependency);
      }

      // Should still yield the root dependency despite all transitive fetches failing
      assert.strictEqual(dependencies.length, 1);
      assert.strictEqual(dependencies[0].name, "test-pkg");
      assert.strictEqual(dependencies[0].id, 0);
      assert.strictEqual(dependencies[0].existOnRemoteRegistry, false);
    });

    test(`Given a manifest where some transitive dependencies fail and others succeed
      it should yield the successful ones and skip the failures without leaking promises`, async(t) => {
      const rootManifest = {
        name: "test-pkg",
        version: "1.0.0",
        dependencies: {
          "good-dep": "^1.0.0",
          "bad-dep": "^1.0.0"
        }
      };

      let callCount = 0;
      const mockedPacoteProvider = {
        manifest: t.mock.fn(async(spec: string) => {
          callCount++;
          // First call: root integrity check -> fail
          if (callCount === 1) {
            throw new Error("root not found");
          }
          // good-dep resolves successfully
          if (typeof spec === "string" && spec.includes("good-dep")) {
            return {
              name: "good-dep",
              version: "1.0.0",
              dependencies: {},
              _integrity: "sha512-good"
            };
          }

          // bad-dep always fails
          throw new Error("503 Service Unavailable");
        }),
        packument: t.mock.fn(async(name: string) => {
          if (name === "good-dep") {
            return {
              "dist-tags": { latest: "1.0.0" },
              versions: {
                "1.0.0": { version: "1.0.0" }
              }
            };
          }

          throw new Error("503 Service Unavailable");
        })
      };

      const walker = new npm.TreeWalker({
        providers: {
          // @ts-expect-error
          pacote: mockedPacoteProvider
        }
      });

      const mama = new ManifestManager(rootManifest);

      const dependencies: DependencyJSON[] = [];
      for await (const dependency of walker.walk(mama, { maxDepth: 10 })) {
        dependencies.push(dependency);
      }

      const names = dependencies
        .map((dependency) => dependency.name)
        .sort();
      // Should yield good-dep and root, but not bad-dep
      assert.ok(names.includes("test-pkg"), "root dependency should be present");
      assert.ok(names.includes("good-dep"), "successful dependency should be present");
      assert.ok(!names.includes("bad-dep"), "failed dependency should be skipped");
    });

    test(`Given a manifest where all transitive dependency fetches throw
      it should not produce unhandled promise rejections`, async(t) => {
      const rootManifest = {
        name: "test-pkg",
        version: "1.0.0",
        dependencies: {
          "fail-a": "^1.0.0",
          "fail-b": "^1.0.0",
          "fail-c": "^1.0.0"
        }
      };

      const mockedPacoteProvider = {
        manifest: t.mock.fn(async() => {
          throw new Error("registry unreachable");
        }),
        packument: t.mock.fn(async() => {
          throw new Error("registry unreachable");
        })
      };

      const walker = new npm.TreeWalker({
        providers: {
          pacote: mockedPacoteProvider
        }
      });

      // This should complete without throwing and without leaking unhandled rejections
      const dependencies: DependencyJSON[] = [];
      const mama = new ManifestManager(rootManifest);
      for await (const dependency of walker.walk(mama, { maxDepth: 10 })) {
        dependencies.push(dependency);
      }

      // Only root should be yielded
      assert.strictEqual(dependencies.length, 1);
      assert.strictEqual(dependencies[0].name, "test-pkg");
      assert.strictEqual(dependencies[0].existOnRemoteRegistry, false);
    });
  });
});

function sortByName(left: string, right: string) {
  return left.length - right.length;
}
