// Import Node.js Dependencies
import { describe, it, test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import pacote from "pacote";

// Import Internal Dependencies
import { npm, type DependencyJSON } from "../../src/index.js";

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
        throw "oh no!";
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

  describe("relationsMaps", () => {
    it("should always be cleared when triggering walk() and return an empty Map if the package has no dependencies", async() => {
      const manifest = await pacote.manifest(
        "@nodesecure/fs-walk@2.0.0"
      ) as pacote.AbbreviatedManifest;

      const walker = new npm.TreeWalker();
      walker.relationsMap.set("foo@1.5.0", new Set());

      for await (const _ of walker.walk(manifest)) {}

      assert.strictEqual(
        walker.relationsMap.size,
        0
      );
    });
  });
});
