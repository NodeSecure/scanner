// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import hash from "object-hash";

// Import Internal Dependencies
import { packageJSONIntegrityHash } from "../src/utils/index.ts";

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

describe("packageJSONIntegrityHash", () => {
  test("Given isFromRemoteRegistry: true then it should remove install script if it contains 'node-gyp rebuild'", () => {
    const { integrity } = packageJSONIntegrityHash({
      ...kMinimalPackageJSON,
      dependencies: {
        install: "node-gyp rebuild"
      }
    }, { isFromRemoteRegistry: true });

    assert.strictEqual(
      integrity,
      kMinimalPackageJSONIntegrity
    );
  });

  test("Given isFromRemoteRegistry: false then the integrity should not match", () => {
    const { integrity } = packageJSONIntegrityHash({
      ...kMinimalPackageJSON,
      dependencies: {
        install: "node-gyp rebuild"
      }
    });

    assert.notStrictEqual(
      integrity,
      kMinimalPackageJSONIntegrity
    );
  });

  test("Given a script with an instance of './node_modules/.bin/'", () => {
    for (const arg of [undefined, { isFromRemoteRegistry: true }]) {
      const { object } = packageJSONIntegrityHash({
        ...kMinimalPackageJSON,
        scripts: {
          test: "./node_modules/.bin/istanbul cover ./node_modules/tape/bin/tape ./test/integration/*.js"
        }
      }, arg);

      assert.strictEqual(
        object.scripts.test,
        "istanbul cover ./node_modules/tape/bin/tape ./test/integration/*.js"
      );
    }
  });
});
