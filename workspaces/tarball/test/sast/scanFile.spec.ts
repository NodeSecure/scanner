// Import Node.js Dependencies
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { scanFile } from "../../src/sast/index.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "..", "fixtures", "scanJavascriptFile");

test("scanFile (fixture one.js)", async() => {
  const result = await scanFile(kFixturePath, "one.js", "yolo");
  assert.deepEqual(result, {
    file: "one.js",
    warnings: [],
    isMinified: false,
    tryDependencies: [],
    dependencies: ["http", "mocha"],
    filesDependencies: ["src\\foo.js", "home\\marco.js"].map((location) => location.replaceAll("\\", path.sep)),
    filesFlags: {
      hasExternalCapacity: false
    }
  });
});

test("scanFile (fixture two.min.js)", async() => {
  const result = await scanFile(kFixturePath, "two.min.js", "yolo");
  assert.deepEqual(result, {
    file: "two.min.js",
    warnings: [],
    isMinified: true,
    tryDependencies: ["http"],
    dependencies: ["http", "fs"],
    filesDependencies: [],
    filesFlags: {
      hasExternalCapacity: false
    }
  });
});

test("scanFile (fixture onelineStmt.min.js)", async() => {
  const result = await scanFile(kFixturePath, "onelineStmt.min.js", "yolo");
  assert.deepEqual(result, {
    file: "onelineStmt.min.js",
    warnings: [],
    isMinified: false,
    tryDependencies: [],
    dependencies: [],
    filesDependencies: ["foobar.js"],
    filesFlags: {
      hasExternalCapacity: false
    }
  });
});

test("scanFile (fixture parsingError.js)", async() => {
  const result = await scanFile(kFixturePath, "parsingError.js", "yolo");

  assert.deepEqual(result, {
    file: "parsingError.js",
    warnings: [
      {
        kind: "parsing-error",
        value: "[1:4-1:5]: Unexpected token: ';'",
        location: [[0, 0], [0, 0]],
        file: "parsingError.js"
      }
    ],
    isMinified: false,
    tryDependencies: [],
    dependencies: [],
    filesDependencies: [],
    filesFlags: {
      hasExternalCapacity: false
    }
  });
});

test("scanFile (fixture fetch.js)", async() => {
  const result = await scanFile(kFixturePath, "fetch.js", "yolo");
  assert.deepEqual(result, {
    file: "fetch.js",
    warnings: [],
    isMinified: false,
    tryDependencies: [],
    dependencies: [],
    filesDependencies: [],
    filesFlags: {
      hasExternalCapacity: true
    }
  });
});
