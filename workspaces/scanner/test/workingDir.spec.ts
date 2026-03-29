// Import Node.js Dependencies
import path from "node:path";
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import * as Vulnera from "@nodesecure/vulnera";
import type { PackageJSON } from "@nodesecure/npm-types";

// Import Internal Dependencies
import {
  workingDir,
  type Payload,
  type Identifier
} from "../src/index.ts";

// CONSTANTS
const kFixturePath = path.join(import.meta.dirname, "fixtures", "depWalker");

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

describe("scanner.workingDir()", () => {
  it("should parse author, homepage and links for a local package who doesn't exist on the remote registry", async() => {
    const file = path.join(kFixturePath, "non-npm-package");
    const result = await workingDir(file, {
      highlight: {
        identifiers: ["foobar@gmail.com", "https://foobar.com/something", "foobar.com", "127.0.0.1"]
      },
      scanRootNode: true
    });

    const dep = result.dependencies["non-npm-package"];
    const v1 = dep.versions["1.0.0"];

    assert.deepEqual(v1.author, {
      name: "NodeSecure"
    });
    assert.deepStrictEqual(v1.links, {
      npm: null,
      homepage: "https://nodesecure.com",
      repository: "https://github.com/NodeSecure/non-npm-package"
    });
    assert.deepStrictEqual(v1.repository, {
      type: "git",
      url: "https://github.com/NodeSecure/non-npm-package.git"
    });

    assert.deepStrictEqual(dep.metadata.author, {
      name: "NodeSecure"
    });
    assert.strictEqual(dep.metadata.homepage, "https://nodesecure.com");
    assert.strictEqual(typeof result.rootDependency.integrity, "string");

    const spec = "non-npm-package@1.0.0";
    assert.partialDeepStrictEqual(sortIdentifiers(result.highlighted.identifiers), sortIdentifiers([
      {
        value: "foobar@gmail.com",
        spec,
        location: { file }
      },
      {
        value: "foobar@gmail.com",
        spec,
        location: { file: path.join(file, "email") }
      },
      {
        value: "https://foobar.com/something",
        spec,
        location: { file }
      },
      {
        value: "foobar.com",
        spec,
        location: { file }
      },
      {
        value: "127.0.0.1",
        spec,
        location: { file }
      }
    ]));
  });

  it("should parse local manifest author field without throwing when attempting to highlight contacts", async() => {
    const { dependencies } = await workingDir(
      path.join(kFixturePath, "non-valid-authors")
    );
    const pkg = dependencies["random-package"];

    assert.deepEqual(pkg.metadata.author, {
      email: "john.doe@gmail.com",
      name: "John Doe"
    });
  });

  it("should scan a workspace package.json and assign 'workspace' as the package name", async() => {
    const result = await workingDir(
      path.join(kFixturePath, "workspace-no-name-version")
    );

    assert.deepStrictEqual(result.rootDependency, {
      name: "workspace",
      version: "0.0.0",
      integrity: null
    });
  });

  describe("cacheLookup", () => {
    it("should return the cached payload without running the dependency walker", async() => {
      const fakePayload = buildFakePayload();
      const file = path.join(kFixturePath, "non-npm-package");

      const capturedPackageJSONs: PackageJSON[] = [];
      const result = await workingDir(file, {
        cacheLookup: async(packageJSON) => {
          capturedPackageJSONs.push(packageJSON);

          return fakePayload;
        }
      });

      assert.strictEqual(result, fakePayload, "should return the exact cached payload instance");
      assert.strictEqual(capturedPackageJSONs.length, 1);
      assert.strictEqual(capturedPackageJSONs[0].name, "non-npm-package");
      assert.strictEqual(capturedPackageJSONs[0].version, "1.0.0");
    });

    it("should proceed with a full scan when null is returned", async() => {
      const file = path.join(kFixturePath, "non-npm-package");

      let callCount = 0;
      const result = await workingDir(file, {
        cacheLookup: async() => {
          callCount++;

          return null;
        }
      });

      assert.strictEqual(callCount, 1, "cacheLookup should have been called once");
      assert.ok(
        result.dependencies["non-npm-package"] !== undefined,
        "should have scanned the package normally"
      );
    });
  });
});

type PartialIdentifer = Omit<Identifier, "location"> & { location: { file: string | null; }; };

function sortIdentifiers(
  identifiers: PartialIdentifer[]
) {
  return identifiers.toSorted((a, b) => uniqueIdentifier(a).localeCompare(uniqueIdentifier(b)));
}

function uniqueIdentifier(identifier: PartialIdentifer) {
  return `${identifier.value} ${identifier.location.file}`;
}
