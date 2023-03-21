// Require Node.js Dependencies
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert";

// Require Third-party Dependencies
import getSize from "get-folder-size";

// Require Internal Dependencies
import { getTarballComposition, getDirNameFromUrl } from "../../src/utils/index.js";

// CONSTANTS
const __dirname = getDirNameFromUrl(import.meta.url);
const FIXTURE_PATH = path.join(__dirname, "..", "fixtures", "getTarballComposition");

describe("getTarballComposition", () => {
  it("should return the composition of a directory", async() => {
    const composition = await getTarballComposition(FIXTURE_PATH);
    const size = await getSize.loose(FIXTURE_PATH);

    assert.deepEqual(composition, {
      ext: new Set(["", ".js", ".json", ".txt"]),
      size,
      files: ["one\\README", "two\\empty.txt", "two\\package.json", "two\\two-deep\\test.js"]
        .map((location) => location.replaceAll("\\", path.sep))
    });
    assert.strictEqual(composition.files.length, 4);
    assert.match(composition.files[0], /one(\/|\\)README/);
  });
});
