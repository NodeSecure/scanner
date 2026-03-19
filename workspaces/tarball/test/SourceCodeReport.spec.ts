// Import Node.js Dependencies
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import { AstAnalyser, DefaultCollectableSet } from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import { SourceCodeScanner } from "../src/class/SourceCodeScanner.class.ts";

// CONSTANTS
const kFixturePath = path.join(import.meta.dirname, "fixtures", "scanJavascriptFile");

test("should have no warning and no minified file", async() => {
  const thirdPartyDependencies = ["mocha", "yolo"];
  const mama = createFakeManifestManager(thirdPartyDependencies);
  const scanner = new SourceCodeScanner(mama);

  const report = await scanner.iterate({
    manifest: [],
    javascript: ["one.js"]
  });
  assert.strictEqual(report.warnings.length, 0);
  assert.strictEqual(report.minified.length, 0);
});

test("should detect a file as minified", async() => {
  const mama = createFakeManifestManager();
  const scanner = new SourceCodeScanner(mama);

  const report = await scanner.iterate({
    manifest: [],
    javascript: ["two.min.js"]
  });
  assert.strictEqual(report.warnings.length, 0);
  assert.strictEqual(report.minified.length, 1);
  assert.deepEqual(report.minified, ["two.min.js"]);
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
      experimental: false,
      file: "parsingError.js",
      i18n: "sast_warnings.parsing_error",
      kind: "parsing-error",
      location: [[0, 0], [0, 0]],
      severity: "Information",
      source: "JS-X-Ray",
      value: "[1:4-1:5]: Unexpected token: ';'"
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

test("should add spec to collectables", async() => {
  const emailSet = new DefaultCollectableSet<{ spec: string; }>("email");
  const mama = createFakeManifestManager();
  const scanner = new SourceCodeScanner(mama, {
    astAnalyser: new AstAnalyser({ collectables: [emailSet] })
  });

  await scanner.iterate({
    manifest: [],
    javascript: ["email.js"]
  });

  assert.deepEqual(Array.from(emailSet)[0].locations[0].metadata?.spec, "fake-package@1.0.0");
});

function createFakeManifestManager(
  dependencies: string[] = [],
  devDependencies: string[] = []
): any {
  return {
    location: kFixturePath,
    dependencies,
    devDependencies,
    spec: "fake-package@1.0.0",
    document: {
      name: "fake-package",
      type: "module"
    }
  };
}
