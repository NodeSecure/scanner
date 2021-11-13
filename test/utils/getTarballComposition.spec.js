// Require Node.js Dependencies
import path from "path";

// Require Third-party Dependencies
import getSize from "get-folder-size";
import test from "tape";

// Require Internal Dependencies
import { getTarballComposition, getDirNameFromUrl } from "../../src/utils/index.js";

// CONSTANTS
const __dirname = getDirNameFromUrl(import.meta.url);
const FIXTURE_PATH = path.join(__dirname, "..", "fixtures", "getTarballComposition");

test("should return the composition of a directory", async(tape) => {
  const composition = await getTarballComposition(FIXTURE_PATH);
  const size = await getSize.loose(FIXTURE_PATH);

  tape.deepEqual(composition, {
    ext: new Set(["", ".js", ".json", ".txt"]),
    size,
    files: ["one\\README", "two\\empty.txt", "two\\package.json", "two\\two-deep\\test.js"]
  });
  tape.strictEqual(composition.files.length, 4);
  tape.match(composition.files[0], /one(\/|\\)README/);

  tape.end();
});
