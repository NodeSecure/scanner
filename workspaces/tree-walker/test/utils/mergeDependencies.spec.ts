// Require Node.js Dependencies
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import assert from "node:assert";

// Require Third-party Dependencies
import is from "@slimio/is";

// Require Internal Dependencies
import { mergeDependencies } from "../../src/utils/index.js";

// CONSTANTS
const currentDirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(currentDirname, "..", "fixtures/mergeDependencies");

// JSON PAYLOADS
const one = JSON.parse(readFileSync(join(FIXTURE_PATH, "one.json"), "utf-8"));
const two = JSON.parse(readFileSync(join(FIXTURE_PATH, "two.json"), "utf-8"));
const three = JSON.parse(readFileSync(join(FIXTURE_PATH, "three.json"), "utf-8"));

test("should return the one.json field 'dependencies' merged", () => {
  const result = mergeDependencies(one);
  assert.ok(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  const expected = new Map([
    ["semver", "^0.1.0"],
    ["test", "~0.5.0"]
  ]);
  assert.deepEqual(result.dependencies, expected);
  assert.deepEqual(result.customResolvers, new Map());
});

test("should return the one.json field 'dependencies' & 'devDependencies' merged", () => {
  const result = mergeDependencies(one, ["dependencies", "devDependencies"]);
  assert.ok(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  const expected = new Map([
    ["semver", "^0.1.0"],
    ["test", "~0.5.0"],
    ["ava", "^1.0.0"]
  ]);
  assert.deepEqual(result.dependencies, expected);
  assert.deepEqual(result.customResolvers, new Map());
});

test("should return two.json 'dependencies' & 'devDependencies' merged (with a custom Resolvers)", () => {
  const result = mergeDependencies(two, ["dependencies", "devDependencies"]);
  assert.ok(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  const expected = new Map([
    ["@slimio/is", "^1.4.0"],
    ["japa", "~0.1.0"]
  ]);
  assert.deepEqual(result.dependencies, expected);

  const resolvers = new Map([
    ["custom", "file:\\file.js"]
  ]);
  assert.deepEqual(result.customResolvers, resolvers);
});

test("should return no dependencies/customResolvers for three.json", () => {
  const result = mergeDependencies(three, ["dependencies", "devDependencies"]);
  assert.ok(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  assert.strictEqual(result.dependencies.size, 0);
  assert.strictEqual(result.customResolvers.size, 0);
});

test("should detect NPM alias using custom resolvers npm: (but still count it as normal dependency)", () => {
  const result = mergeDependencies({
    dependencies: {
      test: "npm:fastify@^4.7.0"
    }
  }, ["dependencies", "devDependencies"]);
  assert.ok(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  assert.strictEqual(result.dependencies.size, 1);
  assert.strictEqual(result.customResolvers.size, 1);
  assert.ok(result.alias.has("test"));
  assert.strictEqual(result.alias.get("test"), "fastify@^4.7.0");
});
