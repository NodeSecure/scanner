// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert";
import { describe, it, test, type TestContext } from "node:test";

// Import Third-party Dependencies
import type {
  PackageJSON,
  WorkspacesPackageJSON
} from "@nodesecure/npm-types";
import hash from "object-hash";

// Import Internal Dependencies
import { ManifestManager } from "../src/index.js";

// CONSTANTS
const kMinimalPackageJSON = {
  name: "foo",
  version: "1.5.0"
};
const kMinimalPackageJSONIntegrity = hash({
  ...kMinimalPackageJSON,
  dependencies: {},
  scripts: {},
  license: "NONE"
});

describe("ManifestManager", () => {
  describe("static Default", () => {
    test("Property must be Frozen", () => {
      const isUpdated = Reflect.set(ManifestManager.Default, "foo", "bar");

      assert.strictEqual(isUpdated, false);
      assert.ok(Object.isFrozen(ManifestManager.Default));
    });
  });

  describe("static fromPackageJSON()", () => {
    test(`Given a location equal to process.cwd(),
      it should read and parse the JSON from filesystem`, async(t) => {
      const readfile = t.mock.method(fs, "readFile", async() => JSON.stringify(kMinimalPackageJSON));

      const location = process.cwd();
      const mama = await ManifestManager.fromPackageJSON(
        location
      );

      assert.equal(readfile.mock.callCount(), 1);
      assert.ok(mama instanceof ManifestManager);

      assert.strictEqual(
        mama.isWorkspace,
        false
      );
      assert.strictEqual(
        mama.spec,
        `${kMinimalPackageJSON.name}@${kMinimalPackageJSON.version}`
      );
    });

    test(`Given a location equal to process.cwd() + package.json,
      it should read and parse the JSON from filesystem`, async(t) => {
      const readFile = t.mock.method(fs, "readFile", async() => JSON.stringify(kMinimalPackageJSON));

      const location = path.join(process.cwd(), "package.json");
      const mama = await ManifestManager.fromPackageJSON(
        location
      );

      assert.equal(readFile.mock.callCount(), 1);
      assert.ok(mama instanceof ManifestManager);

      assert.strictEqual(
        mama.isWorkspace,
        false
      );
      assert.strictEqual(
        mama.spec,
        `${kMinimalPackageJSON.name}@${kMinimalPackageJSON.version}`
      );
      assert.strictEqual(
        mama.location,
        location
      );
    });

    test("Given an invalid JSON, it should throw a custom Error with the parsing error as a cause", async(t: TestContext) => {
      const location = process.cwd();
      const expectedLocation = path.join(location, "package.json");

      const readFile = t.mock.method(fs, "readFile", async() => "{ foo: NaN }");
      t.plan(5);

      try {
        await ManifestManager.fromPackageJSON(
          process.cwd()
        );
      }
      catch (error) {
        t.assert.strictEqual(error.name, "Error");
        t.assert.strictEqual(
          error.message,
          `Failed to parse package.json located at: ${expectedLocation}`
        );

        t.assert.ok("cause" in error);
        t.assert.strictEqual(error.cause.name, "SyntaxError");
      }

      t.assert.equal(readFile.mock.callCount(), 1);
    });

    test("Given the location argument is not a string, it must throw a TypeError", async() => {
      await assert.rejects(
        () => ManifestManager.fromPackageJSON({} as any),
        {
          name: "TypeError",
          message: "location must be a string primitive"
        }
      );
    });
  });

  describe("constructor()", () => {
    it("Should deep clone the provided document", () => {
      const mama = new ManifestManager(kMinimalPackageJSON);

      assert.notStrictEqual(mama.document, kMinimalPackageJSON);
    });

    it("Should set default values for multiple properties if they are not present in the provided document.", () => {
      const mama = new ManifestManager(kMinimalPackageJSON);

      assert.deepStrictEqual(
        mama.document,
        {
          ...kMinimalPackageJSON,
          ...ManifestManager.Default
        }
      );
    });

    it("Should store location if provided", () => {
      const location = "/tmp/fake/path/package.json";
      const mama = new ManifestManager(kMinimalPackageJSON, { location });
      assert.strictEqual(mama.location, location);
    });

    it("Should have location undefined if not provided", () => {
      const mama = new ManifestManager(kMinimalPackageJSON);
      assert.strictEqual(mama.location, undefined);
    });
  });

  describe("get dependencies", () => {
    test("Given a PackageJSON with no dependencies, it must return an empty Array", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON
      };

      const mama = new ManifestManager(packageJSON);
      assert.deepEqual(mama.dependencies, []);
    });

    test("Given a PackageJSON with multiple dependencies, it must return their names", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON,
        dependencies: {
          kleur: "1.0.0",
          mocha: "1.0.0"
        }
      };

      const mama = new ManifestManager(packageJSON);
      assert.deepEqual(
        mama.dependencies,
        ["kleur", "mocha"]
      );
    });
  });

  describe("get devDependencies", () => {
    test("Given a PackageJSON with no devDependencies, it must return an empty Array", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON
      };

      const mama = new ManifestManager(packageJSON);
      assert.deepEqual(mama.devDependencies, []);
    });

    test("Given a PackageJSON with multiple devDependencies, it must return their names", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON,
        devDependencies: {
          kleur: "1.0.0",
          mocha: "1.0.0"
        }
      };

      const mama = new ManifestManager(packageJSON);
      assert.deepEqual(
        mama.devDependencies,
        ["kleur", "mocha"]
      );
    });
  });

  describe("get nodejsImports", () => {
    test("Given a PackageJSON with no imports, it must return an empty Object", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON
      };

      const mama = new ManifestManager(packageJSON);
      assert.deepStrictEqual(mama.nodejsImports, {});
    });

    test("Given a PackageJSON with one import subpath, it must be returned unchanged", () => {
      const nodeImport: PackageJSON["imports"] = {
        "#dep": {
          node: "something"
        }
      };
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON,
        imports: { ...nodeImport }
      };

      const mama = new ManifestManager(packageJSON);
      assert.deepStrictEqual(
        mama.nodejsImports,
        nodeImport
      );
    });
  });

  describe("get spec", () => {
    test("Given a PackageJSON, it should return the NPM spec by combining the name and version", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON
      };

      const mama = new ManifestManager(packageJSON);

      assert.strictEqual(
        mama.spec,
        `${packageJSON.name}@${packageJSON.version}`
      );
    });

    test(`Given a WorkspacesPackageJSON with 'name' and 'version' properties available,
      it should return the NPM spec by combining the name and version`, () => {
      const workspacePackageJSON: WorkspacesPackageJSON = {
        ...kMinimalPackageJSON,
        workspaces: []
      };

      const mama = new ManifestManager(workspacePackageJSON);

      assert.strictEqual(
        mama.spec,
        `${workspacePackageJSON.name}@${workspacePackageJSON.version}`
      );
    });

    test(`Given a WorkspacesPackageJSON with either 'name' or 'version' (or both) missing,
      it must throw an Error`, () => {
      const cases: WorkspacesPackageJSON[] = [
        {
          workspaces: ["src/a"]
        },
        {
          name: "foo",
          workspaces: ["src/a"]
        },
        {
          version: "1.0.0",
          workspaces: ["src/a"]
        }
      ];

      for (const wsPackageJSON of cases) {
        assert.throws(
          () => new ManifestManager(wsPackageJSON).spec,
          {
            name: "Error",
            message: "spec is not available for the given workspace"
          }
        );
      }
    });
  });

  describe("get author", () => {
    test("Given a PackageJSON with an unparsed author field, it should parse it and return a Contact object.", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON,
        author: "John Doe <john.doe@gmail.com>"
      };

      const mama = new ManifestManager(packageJSON);

      assert.deepStrictEqual(
        mama.author,
        {
          name: "John Doe",
          email: "john.doe@gmail.com"
        }
      );
    });

    test("Given a PackageJSON with a parsed author field, it must be returned unchanged.", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON,
        author: {
          name: "John Doe",
          email: "john.doe@gmail.com"
        }
      };

      const mama = new ManifestManager(packageJSON);

      assert.deepStrictEqual(
        mama.author,
        packageJSON.author
      );
    });

    test("Given a PackageJSON with no author field, it must return null.", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON
      };

      const mama = new ManifestManager(packageJSON);

      assert.deepStrictEqual(
        mama.author,
        null
      );
    });
  });

  describe("get isWorkspace", () => {
    test("Given a PackageJSON it must return false", () => {
      const mama = new ManifestManager(kMinimalPackageJSON);

      assert.strictEqual(
        mama.isWorkspace,
        false
      );
    });

    test("Given a WorkspacesPackageJSON it must return true", () => {
      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        workspaces: ["src/a"]
      });

      assert.ok(mama.isWorkspace);
    });
  });

  describe("get integry", () => {
    test("Given a WorkspacesPackageJSON, it must throw an error stating that workspaces are not supported.", () => {
      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        workspaces: ["src/a"]
      });

      assert.throws(
        () => mama.integrity,
        {
          name: "Error",
          message: "integrity is not available for workspaces"
        }
      );
    });

    test("Given a minimal PackageJSON, it must return the expected hash", () => {
      const mama = new ManifestManager(kMinimalPackageJSON);

      assert.strictEqual(
        mama.integrity,
        kMinimalPackageJSONIntegrity
      );
    });

    test("Given a minimal PackageJSON with a different license, it must not return the expected hash", () => {
      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        license: "MIT"
      });

      assert.notStrictEqual(
        mama.integrity,
        kMinimalPackageJSONIntegrity
      );
    });

    test("Given two PackageJSON files with unordered properties, the hash must be equal.", () => {
      const mamaA = new ManifestManager({
        ...kMinimalPackageJSON,
        dependencies: {
          kleur: "1.4.4"
        },
        scripts: {
          start: "node index.js",
          build: "tsc"
        }
      });
      const mamaB = new ManifestManager({
        scripts: {
          build: "tsc",
          start: "node index.js"
        },
        ...kMinimalPackageJSON,
        dependencies: {
          kleur: "1.4.4"
        }
      });

      assert.strictEqual(
        mamaA.integrity,
        mamaB.integrity,
        "hash values must be equal because both PackageJSON has the same set of properties"
      );
    });

    test("Given two different PackageJSON, the hash must not be equal.", () => {
      const mamaA = new ManifestManager({
        ...kMinimalPackageJSON,
        dependencies: {
          kleur: "1.4.4"
        }
      });
      const mamaB = new ManifestManager({
        ...kMinimalPackageJSON,
        scripts: {
          build: "tsc",
          start: "node index.js"
        }
      });

      assert.notStrictEqual(
        mamaA.integrity,
        mamaB.integrity
      );
    });
  });

  describe("get hasZeroSemver", () => {
    test("Given a PackageJSON with a semver higher than 1.x.x then it must return false", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON
      };

      const mama = new ManifestManager(packageJSON);
      assert.strictEqual(mama.hasZeroSemver, false);
    });

    test("Given a PackageJSON with a semver starting with 0.x it must return true", () => {
      const packageJSON: PackageJSON = {
        name: "foobar",
        version: "0.5.5"
      };

      const mama = new ManifestManager(packageJSON);
      assert.ok(mama.hasZeroSemver);
    });

    test("Given a WorkspacesPackageJSON with no version it must return false", () => {
      const packageJSON: WorkspacesPackageJSON = {
        workspaces: []
      };

      const mama = new ManifestManager(packageJSON);
      assert.strictEqual(mama.hasZeroSemver, false);
    });

    test("Given a WorkspacesPackageJSON with a semver starting with 0.x it must return true", () => {
      const packageJSON: WorkspacesPackageJSON = {
        version: "0.1.2",
        workspaces: []
      };

      const mama = new ManifestManager(packageJSON);
      assert.ok(mama.hasZeroSemver);
    });
  });

  describe("get license", () => {
    test("Given a minimal PackageJSON with no license field then it must return null", () => {
      const mama = new ManifestManager(kMinimalPackageJSON);

      assert.strictEqual(
        mama.license,
        null
      );
    });

    test("Given a minimal PackageJSON with a string license then it must return the exact license value", () => {
      const expectedLicense = "MIT";

      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        license: expectedLicense
      });

      assert.strictEqual(
        mama.license,
        expectedLicense
      );
    });

    test("Given a minimal PackageJSON with a license object then it must return the 'type' property value", () => {
      const expectedLicense = "MIT";

      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        license: {
          type: expectedLicense
        }
      });

      assert.strictEqual(
        mama.license,
        expectedLicense
      );
    });

    test("Given a minimal PackageJSON with a licenses object then it must return the 'type' property value", () => {
      const expectedLicense = "MIT";

      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        licenses: {
          type: expectedLicense
        }
      });

      assert.strictEqual(
        mama.license,
        expectedLicense
      );
    });

    test("Given a minimal PackageJSON with a licenses array then it must return the first license type", () => {
      const expectedLicense = "MIT";

      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        licenses: [
          {
            type: expectedLicense
          }
        ]
      });

      assert.strictEqual(
        mama.license,
        expectedLicense
      );
    });

    test("Given a minimal PackageJSON with an empty licenses array then it must return null", () => {
      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        licenses: []
      });

      assert.strictEqual(
        mama.license,
        null
      );
    });

    test("Given a minimal PackageJSON with licenses array and unexpected values then it must return null", () => {
      const mama = new ManifestManager({
        ...kMinimalPackageJSON,
        licenses: ["MIT"] as any
      });

      assert.strictEqual(
        mama.license,
        null
      );
    });
  });

  describe("flags", () => {
    test("Given a minimal PackageJSON we must verify default values", () => {
      const mama = new ManifestManager(kMinimalPackageJSON);

      assert.deepStrictEqual(
        mama.flags,
        {
          hasUnsafeScripts: false,
          isNative: false
        }
      );
    });

    test("Property must be Sealed", () => {
      const mama = new ManifestManager(kMinimalPackageJSON);

      assert.ok(Object.isSealed(mama.flags));

      const isUpdated = Reflect.set(mama.flags, "isNative", true);
      assert.ok(isUpdated);
      assert.ok(mama.flags.isNative);
    });

    describe("isNative", () => {
      it("Must equal true if either dependencies or devDependencies contains a native package", () => {
        const cases: PackageJSON[] = [
          {
            ...kMinimalPackageJSON,
            dependencies: {
              "node-gyp": "^1.0.0"
            }
          },
          {
            ...kMinimalPackageJSON,
            devDependencies: {
              "node-gyp": "^1.0.0"
            }
          }
        ];

        for (const packageJSON of cases) {
          const mama = new ManifestManager(packageJSON);
          assert.ok(mama.flags.isNative);
        }
      });

      it("Must equal true if gypfile is present and truthy", () => {
        const packageJSON: PackageJSON = {
          ...kMinimalPackageJSON,
          gypfile: true
        };

        const mama = new ManifestManager(packageJSON);
        assert.ok(mama.flags.isNative);
      });

      it(`Must equal false if gypfile is falsy and none of the dependencies or devDependencies
        contain an identified native package to build or provide N-API features.`, () => {
        const packageJSON: PackageJSON = {
          ...kMinimalPackageJSON,
          dependencies: {
            kleur: "1.0.0"
          },
          devDependencies: {
            mocha: "1.0.0"
          },
          gypfile: false
        };

        const mama = new ManifestManager(packageJSON);
        assert.strictEqual(
          mama.flags.isNative,
          false
        );
      });
    });

    describe("hasUnsafeScripts", () => {
      it("Must equal true if scripts contains at least one unsafe NPM built-in script, such as postinstall.", () => {
        const cases: PackageJSON[] = [
          {
            ...kMinimalPackageJSON,
            scripts: {
              preinstall: ""
            }
          },
          {
            ...kMinimalPackageJSON,
            scripts: {
              install: ""
            }
          }
        ];

        for (const packageJSON of cases) {
          const mama = new ManifestManager(packageJSON);
          assert.ok(mama.flags.hasUnsafeScripts);
        }
      });

      it("Must equal false if none of the script are unsafe", () => {
        const packageJSON: PackageJSON = {
          ...kMinimalPackageJSON,
          scripts: {
            start: "node index.js",
            build: "tsc -b"
          }
        };

        const mama = new ManifestManager(packageJSON);
        assert.strictEqual(
          mama.flags.hasUnsafeScripts,
          false
        );
      });
    });
  });

  describe("getEntryFiles", () => {
    it("should return PackageJSON main entry files", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON,
        main: "./dist/index.js",
        exports: "./dist/foobar.js"
      };

      const mama = new ManifestManager(packageJSON);
      const files = new Set(mama.getEntryFiles());

      assert.deepEqual(
        [...files],
        [
          "./dist/index.js",
          "./dist/foobar.js"
        ]
      );
    });

    it("should deep extract Node.js export fields in PackageJSON", () => {
      const packageJSON: PackageJSON = {
        ...kMinimalPackageJSON,
        exports: {
          ".": {
            import: "./index.js"
          },
          "./web": {
            import: "./src/web.js"
          },
          "./package.json": "./package.json"
        }
      };

      const mama = new ManifestManager(packageJSON);
      const files = new Set(mama.getEntryFiles());

      assert.deepEqual(
        [...files],
        [
          "./index.js",
          "./src/web.js",
          "./package.json"
        ]
      );
    });
  });
});
