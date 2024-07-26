// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import hash from "object-hash";

// Import Internal Dependencies
import { packageJSONIntegrityHash } from "../src/utils/index.js";

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
    const integrityHash = packageJSONIntegrityHash({
      ...kMinimalPackageJSON,
      dependencies: {
        install: "node-gyp rebuild"
      }
    }, { isFromRemoteRegistry: true });

    assert.strictEqual(
      integrityHash,
      kMinimalPackageJSONIntegrity
    );
  });

  test("Given isFromRemoteRegistry: false then the integrity should not match", () => {
    const integrityHash = packageJSONIntegrityHash({
      ...kMinimalPackageJSON,
      dependencies: {
        install: "node-gyp rebuild"
      }
    });

    assert.notStrictEqual(
      integrityHash,
      kMinimalPackageJSONIntegrity
    );
  });
});
