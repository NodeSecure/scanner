// Require Node.js Dependencies
import { promisify } from "util";
import { join } from "path";

// Require Third-party Dependencies
import getSize from "get-folder-size";

// Require Internal Dependencies
import { getTarballComposition, getDirNameFromUrl } from "../../src/utils/index.js";

// CONSTANTS
const dirname = getDirNameFromUrl(import.meta.url);
const FIXTURE_PATH = join(dirname, "..", "fixtures", "getTarballComposition");


test("should return the composition of a directory", async() => {
  const composition = await getTarballComposition(FIXTURE_PATH);
  const size = await getSize.loose(FIXTURE_PATH);

  expect(composition).toMatchObject({
    ext: new Set(["", ".js", ".json", ".txt"]),
    size
  });
  expect(composition.files).toHaveLength(4);
  expect(composition.files[0]).toMatch(/one(\/|\\)README/);
  expect(true).toBe(true);
});
