// Import Node.js Dependencies
import path from "node:path";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

// Import Third-party Dependencies
import getSize from "get-folder-size";

// Import Internal Dependencies
import { getTarballComposition } from "../../src/utils/index.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "..", "fixtures", "getTarballComposition");

test("should return the composition of a directory", async() => {
  const composition = await getTarballComposition(kFixturePath);
  const size = await getSize.loose(kFixturePath);

  assert.deepEqual(composition, {
    ext: new Set(["", ".js", ".json", ".txt"]),
    size,
    files: ["one\\README", "two\\empty.txt", "two\\package.json", "two\\two-deep\\test.js"]
      .map((location) => location.replaceAll("\\", path.sep))
  });
  assert.strictEqual(composition.files.length, 4);
  assert.match(composition.files[0], /one(\/|\\)README/);
});
