// Import Node.js Dependencies
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { filterDependencyKind } from "../../src/utils/index.js";

test("filterDependencyKind should be able to split files and packages", () => {
  const result = filterDependencyKind(["mocha", "."], process.cwd());
  assert.deepEqual(result.files, ["index.js"]);
  assert.deepEqual(result.packages, ["mocha"]);
});

test("filterDependencyKind should be able to match all relative import path", () => {
  const result = filterDependencyKind([".", "./", "..", "../"], process.cwd());
  assert.deepEqual(result.files, [
    "index.js",
    "index.js",
    "..\\index.js",
    "..\\index.js"
  ].map((location) => location.replaceAll("\\", path.sep)));
  assert.deepEqual(result.packages, []);
});

test("filterDependencyKind should be able to match a file and join with the relative path", () => {
  const result = filterDependencyKind(["./foobar.js"], process.cwd());
  assert.deepEqual(result.files, [
    path.join(process.cwd(), "foobar.js")
  ]);
  assert.deepEqual(result.packages, []);
});

test("filterDependencyKind should be able to automatically append the '.js' extension", () => {
  const result = filterDependencyKind(["./foobar"], process.cwd());
  assert.deepEqual(result.files, [
    path.join(process.cwd(), "foobar.js")
  ]);
  assert.deepEqual(result.packages, []);
});
