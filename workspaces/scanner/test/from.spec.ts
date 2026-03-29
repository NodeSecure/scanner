// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import * as Vulnera from "@nodesecure/vulnera";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";
import type pacote from "pacote";

// Import Internal Dependencies
import {
  from,
  type Payload
} from "../src/index.ts";

function buildFakePayload(): Payload {
  return {
    id: "cached-payload-id",
    rootDependency: { name: "fake", version: "1.0.0", integrity: null },
    warnings: [],
    highlighted: { contacts: [], packages: [], identifiers: [] },
    dependencies: {},
    scannerVersion: "0.0.0",
    vulnerabilityStrategy: Vulnera.strategies.NONE,
    metadata: {
      startedAt: 0,
      executionTime: 0,
      apiCallsCount: 0,
      apiCalls: [],
      errorCount: 0,
      errors: []
    }
  };
}

describe("scanner.from()", () => {
  it("should fetch the payload of pacote on the npm registry", async() => {
    const result = await from(
      "pacote",
      {
        maxDepth: 10,
        vulnerabilityStrategy: Vulnera.strategies.GITHUB_ADVISORY
      }
    );

    assert.deepEqual(Object.keys(result), [
      "id",
      "rootDependency",
      "scannerVersion",
      "vulnerabilityStrategy",
      "warnings",
      "highlighted",
      "dependencies",
      "metadata"
    ]);
    assert.strictEqual(typeof result.rootDependency.integrity, "string");
  });

  it.skip("should fetch the payload of pacote on the gitlab registry", async() => {
    const result = await from("pacote", {
      registry: "https://gitlab.com/api/v4/packages/npm/",
      maxDepth: 10,
      vulnerabilityStrategy: Vulnera.strategies.GITHUB_ADVISORY
    });

    assert.deepEqual(Object.keys(result), [
      "id",
      "rootDependency",
      "scannerVersion",
      "vulnerabilityStrategy",
      "warnings",
      "highlighted",
      "dependencies",
      "metadata"
    ]);
    assert.strictEqual(typeof result.rootDependency.integrity, "string");
  });

  it("should highlight contacts from a remote package", async() => {
    const spec = "@adonisjs/logger";
    const result = await from(spec, {
      highlight: {
        contacts: [
          {
            name: "/.*virk.*/i"
          }
        ]
      }
    });

    assert.ok(result.highlighted.contacts.length > 0);
    const maintainer = result.highlighted.contacts[0]!;
    assert.ok(
      maintainer.dependencies.includes(spec)
    );
  });

  describe("cacheLookup", () => {
    it("should return the cached payload without running the dependency walker", async() => {
      const fakePayload = buildFakePayload();

      const capturedManifests: (pacote.AbbreviatedManifest & pacote.ManifestResult)[] = [];
      const result = await from("@slimio/is", {
        registry: getLocalRegistryURL(),
        cacheLookup: async(manifest) => {
          capturedManifests.push(manifest);

          return fakePayload;
        }
      });

      assert.strictEqual(result, fakePayload, "should return the exact cached payload instance");
      assert.strictEqual(capturedManifests.length, 1);
      assert.strictEqual(capturedManifests[0].name, "@slimio/is");
    });

    it("should proceed with a full scan when null is returned", async() => {
      let callCount = 0;
      const result = await from("@slimio/is", {
        registry: getLocalRegistryURL(),
        maxDepth: 1,
        cacheLookup: async() => {
          callCount++;

          return null;
        }
      });

      assert.strictEqual(callCount, 1, "cacheLookup should have been called once");
      assert.ok(
        result.dependencies["@slimio/is"] !== undefined,
        "should have scanned the package normally"
      );
    });
  });
});
