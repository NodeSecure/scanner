// Import Node.js Dependencies
import { describe, it, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert";
import path from "node:path";

// Import Third-party Dependencies
import pacote from "pacote";
import type { PackageJSON, WorkspacesPackageJSON } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { npm, type DependencyJSON } from "../../src/index.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturesDir = path.join(__dirname, "..", "fixtures");

describe("npm.TreeWalker", () => {
  test("Given a fixed '@nodesecure/fs-walk' manifest then it must extract one root dependency", async() => {
    const spec = "@nodesecure/fs-walk@2.0.0";
    const manifest = await pacote.manifest(spec) as pacote.AbbreviatedManifest;

    const walker = new npm.TreeWalker();

    for await (const dependency of walker.walk(manifest)) {
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
          alias: {}
        }
      );
    }
  });

  test(`Given a manifest with only one dependency and a mocked pacote.manifest function that throw an Error
    then it's must set existOnRemoteRegistry to false on the root dependency`, async(t) => {
    const spec = "@nodesecure/fs-walk@2.0.0";
    const manifest = await pacote.manifest(spec) as pacote.AbbreviatedManifest;

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

    for await (const dependency of walker.walk(manifest)) {
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
          alias: {}
        }
      );
    }
  });

  test(`Given a fixed 'fastify' manifest and maxDepth option equal to one then
    it must return only the package direct dependencies`, async() => {
    const spec = "fastify@4.28.1";
    const manifest = await pacote.manifest(spec) as pacote.AbbreviatedManifest;

    const walker = new npm.TreeWalker();

    const dependencies: DependencyJSON[] = [];
    for await (const dependency of walker.walk(manifest, { maxDepth: 1 })) {
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
    const manifestLocation = path.join(__dirname, "..", "..", "..", "..", "package.json");

    const manifest = (
      await import(pathToFileURL(manifestLocation).href, { with: { type: "json" } })
    ).default as WorkspacesPackageJSON;
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
    for await (const dependency of walker.walk(manifest, walkOptions)) {
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
    assert.strictEqual(
      names.length,
      rootDependency.dependencyCount + 1
    );
    assert.deepEqual(
      names,
      [
        ...manifestWorkspaces,
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

    const walker = new npm.TreeWalker();
    const walkOptions: npm.WalkOptions = {
      maxDepth: 1,
      packageLock: {
        location: path.dirname(manifestLocation),
        fetchManifest: false
      }
    };

    const dependencies: DependencyJSON[] = [];
    for await (const dependency of walker.walk(manifest, walkOptions)) {
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
      ) as pacote.AbbreviatedManifest;

      const walker = new npm.TreeWalker();
      walker.relationsMap.set("foo@1.5.0", new Set());

      for await (const _ of walker.walk(manifest)) {
        // do nothing
      }

      assert.strictEqual(
        walker.relationsMap.size,
        0
      );
    });
  });
});

function sortByName(left: string, right: string) {
  return left.length - right.length;
}
