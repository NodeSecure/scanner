// Import Node.js Dependencies
import assert from "node:assert/strict";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import { type PackumentVersion } from "@nodesecure/npm-types";

// Import Internal Dependencies
import * as utils from "../../src/utils/index.js";

describe("utils.getLinks", () => {
  it("should return all links", () => {
    assert.deepStrictEqual(utils.getLinks({
      homepage: "https://github.com/foo/bar",
      repository: "git@github.com:foo/bar.git",
      name: "foo",
      version: "1.0.0"
    } as any as PackumentVersion), {
      npm: "https://www.npmjs.com/package/foo/v/1.0.0",
      homepage: "https://github.com/foo/bar",
      repository: "https://github.com/foo/bar"
    });
  });

  it("homepage should be null but repository should be parsed", () => {
    assert.deepStrictEqual(utils.getLinks({
      homepage: null,
      repository: "https://github.com/foo/bar.git",
      name: "foo",
      version: "1.0.0"
    } as any), {
      npm: "https://www.npmjs.com/package/foo/v/1.0.0",
      homepage: null,
      repository: "https://github.com/foo/bar"
    });
  });

  it("should return repository.url", () => {
    assert.deepStrictEqual(utils.getLinks({
      name: "foo",
      version: "1.0.0",
      homepage: "https://github.com/foo/bar",
      repository: {
        type: "git",
        url: "github.com/foo/bar"
      }
    } as any), {
      npm: "https://www.npmjs.com/package/foo/v/1.0.0",
      homepage: "https://github.com/foo/bar",
      repository: "https://github.com/foo/bar"
    });
  });
});

describe("utils.getManifestLinks", () => {
  it("should return homepage and repository", () => {
    assert.deepStrictEqual(utils.getManifestLinks({
      name: "@foo/bar",
      version: "1.0.0",
      homepage: "https://github.com/foo/bar",
      repository: "https://github.com/foo/bar"
    }), {
      npm: null,
      homepage: "https://github.com/foo/bar",
      repository: "https://github.com/foo/bar"
    });
  });

  it("should return repository only", () => {
    assert.deepStrictEqual(utils.getManifestLinks({
      name: "@foo/bar",
      version: "1.0.0",
      homepage: void 0,
      repository: "https://github.com/foo/bar"
    }), {
      npm: null,
      homepage: null,
      repository: "https://github.com/foo/bar"
    });
  });

  it("should return repository.url", () => {
    assert.deepStrictEqual(utils.getManifestLinks({
      name: "@foo/bar",
      version: "1.0.0",
      homepage: void 0,
      repository: {
        type: "git",
        url: "https://github.com/foo/bar"
      }
    }), {
      npm: null,
      homepage: null,
      repository: "https://github.com/foo/bar"
    });
  });
});
