// Import Node.js Dependencies
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { SourceCodeScanner } from "../src/class/SourceCodeScanner.class.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "fixtures", "scanJavascriptFile");

test("should detect all required dependencies (node, files, third-party)", async() => {
  const thirdPartyDependencies = ["mocha", "yolo"];
  const mama = createFakeManifestManager(thirdPartyDependencies);
  const scanner = new SourceCodeScanner(mama);

  const report = await scanner.iterate({
    manifest: [],
    javascript: ["one.js"]
  });
  assert.strictEqual(report.warnings.length, 0);
  assert.strictEqual(report.minified.length, 0);

  const { files, dependencies, flags } = report.groupAndAnalyseDependencies(mama);

  assert.deepEqual(
    normalize(files),
    normalize([
      "src\\foo.js",
      "home\\marco.js"
    ])
  );
  assert.deepEqual(dependencies, {
    nodejs: ["http"],
    subpathImports: {},
    thirdparty: thirdPartyDependencies,
    missing: [],
    unused: []
  });
  assert.deepEqual(flags, {
    hasExternalCapacity: true,
    hasMissingOrUnusedDependency: false
  });
});

test("should detect and report Node.js dependencies and tag file as minified", async() => {
  const mama = createFakeManifestManager();
  const scanner = new SourceCodeScanner(mama);

  const report = await scanner.iterate({
    manifest: [],
    javascript: ["two.min.js"]
  });
  assert.strictEqual(report.warnings.length, 0);
  assert.strictEqual(report.minified.length, 1);

  const {
    dependencies,
    dependenciesInTryBlock,
    flags
  } = report.groupAndAnalyseDependencies(mama);

  assert.deepEqual(dependencies.nodejs, ["http", "fs"]);
  assert.deepEqual(dependenciesInTryBlock, ["http"]);
  assert.deepEqual(report.minified, ["two.min.js"]);
  assert.ok(flags.hasExternalCapacity);
});

test("should report one required file and no minified file (because one-line requirement stmt)", async() => {
  const mama = createFakeManifestManager();
  const scanner = new SourceCodeScanner(mama);

  const report = await scanner.iterate({
    manifest: [],
    javascript: ["onelineStmt.min.js"]
  });
  assert.strictEqual(report.warnings.length, 0);
  assert.strictEqual(report.minified.length, 0);

  const {
    files,
    dependencies,
    flags
  } = report.groupAndAnalyseDependencies(mama);

  assert.deepEqual([...files], ["foobar.js"]);
  assert.deepEqual(dependencies, {
    nodejs: [],
    subpathImports: {},
    thirdparty: [],
    missing: [],
    unused: []
  });
  assert.deepEqual(flags, {
    hasExternalCapacity: false,
    hasMissingOrUnusedDependency: false
  });
});

test("should catch the invalid syntax and report a ParsingError warning", async() => {
  const mama = createFakeManifestManager();
  const scanner = new SourceCodeScanner(mama);

  const report = await scanner.iterate({
    manifest: [],
    javascript: ["parsingError.js"]
  });
  assert.strictEqual(report.warnings.length, 1);
  assert.strictEqual(report.minified.length, 0);

  assert.deepEqual(report.warnings, [
    {
      kind: "parsing-error",
      value: "[1:4-1:5]: Unexpected token: ';'",
      location: [[0, 0], [0, 0]],
      file: "parsingError.js"
    }
  ]);
});

test("should detect the usage of global fetch and update hasExternalCapacity flag to true", async() => {
  const mama = createFakeManifestManager();
  const scanner = new SourceCodeScanner(mama);

  const report = await scanner.iterate({
    manifest: [],
    javascript: ["fetch.js"]
  });
  assert.strictEqual(report.warnings.length, 0);
  assert.strictEqual(report.minified.length, 0);
  assert.ok(report.flags.hasExternalCapacity);
});

function normalize(values: Iterable<string>): string[] {
  return Array.from(values)
    .map((value) => path.normalize(value))
    .sort();
}

function createFakeManifestManager(
  dependencies: string[] = [],
  devDependencies: string[] = []
): any {
  return {
    location: kFixturePath,
    dependencies,
    devDependencies,
    document: {
      name: "fake-package",
      type: "module"
    }
  };
}
