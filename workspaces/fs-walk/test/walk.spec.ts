// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Internal Dependencies
import { walk, walkSync } from "../src/index.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const kRootLocation = path.join(__dirname, "..");
const kFixturesDir = path.join(__dirname, "fixtures");

const kExpectedJSFiles = [
  "src/index.ts",
  "src/constants.ts",
  "src/types.ts",
  "src/walk.ts",
  "src/walkSync.ts",
  "test/walk.spec.ts"
]
  .map((fileLocation) => path.normalize(fileLocation))
  .sort();

describe("walk", () => {
  it("should return all TypeScript files of the package", async() => {
    const files: string[] = [];
    const options = { extensions: new Set([".ts"]) };

    for await (const [dirent, absoluteFileLocation] of walk(
      kRootLocation,
      options
    )) {
      if (dirent.isFile()) {
        files.push(path.relative(kRootLocation, absoluteFileLocation));
      }
    }

    assert.deepEqual(
      removeDistFiles(files.sort()),
      kExpectedJSFiles
    );
  });
});

describe("walkSync", () => {
  it("should return all TypeScript files of the package", () => {
    const options = { extensions: new Set([".ts"]) };

    const files = [...walkSync(kRootLocation, options)]
      .filter(([dirent]) => dirent.isFile())
      .map(([, absoluteFileLocation]) => path.relative(kRootLocation, absoluteFileLocation));

    assert.deepEqual(
      removeDistFiles(files),
      kExpectedJSFiles
    );
  });

  it("should return all files in the fixtures directory", () => {
    const files = [...walkSync(kFixturesDir)]
      .filter(([dirent]) => dirent.isFile())
      .map(([, absoluteFileLocation]) => path.relative(kRootLocation, absoluteFileLocation));

    const expectedFiles = [
      "test/fixtures/foobar.txt",
      "test/fixtures/test.md"
    ].map((fileLocation) => path.normalize(fileLocation));

    assert.deepEqual(
      removeDistFiles(files),
      expectedFiles
    );
  });
});

function removeDistFiles(files: string[]): string[] {
  return files.filter((file) => !file.includes("dist"));
}
