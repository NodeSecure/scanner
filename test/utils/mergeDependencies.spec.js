// Require Node.js Dependencies
import { join } from "path";
import { readFileSync } from "fs";

// Require Third-party Dependencies
import is from "@slimio/is";
import test from "tape";

// Require Internal Dependencies
import { mergeDependencies, getDirNameFromUrl } from "../../src/utils/index.js";

// CONSTANTS
const currentDirname = getDirNameFromUrl(import.meta.url);
const FIXTURE_PATH = join(currentDirname, "..", "fixtures/mergeDependencies");

// JSON PAYLOADS
const one = JSON.parse(readFileSync(join(FIXTURE_PATH, "one.json"), "utf-8"));
const two = JSON.parse(readFileSync(join(FIXTURE_PATH, "two.json"), "utf-8"));
const three = JSON.parse(readFileSync(join(FIXTURE_PATH, "three.json"), "utf-8"));

test("should return the one.json field 'dependencies' merged", (tape) => {
  const result = mergeDependencies(one);
  tape.true(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  const expected = new Map([
    ["semver", "^0.1.0"],
    ["test", "~0.5.0"]
  ]);
  tape.deepEqual(result.dependencies, expected);
  tape.deepEqual(result.customResolvers, new Map());

  tape.end();
});

test("should return the one.json field 'dependencies' & 'devDependencies' merged", (tape) => {
  const result = mergeDependencies(one, ["dependencies", "devDependencies"]);
  tape.true(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  const expected = new Map([
    ["semver", "^0.1.0"],
    ["test", "~0.5.0"],
    ["ava", "^1.0.0"]
  ]);
  tape.deepEqual(result.dependencies, expected);
  tape.deepEqual(result.customResolvers, new Map());

  tape.end();
});

test("should return two.json 'dependencies' & 'devDependencies' merged (with a custom Resolvers)", (tape) => {
  const result = mergeDependencies(two, ["dependencies", "devDependencies"]);
  tape.true(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  const expected = new Map([
    ["@slimio/is", "^1.4.0"],
    ["japa", "~0.1.0"]
  ]);
  tape.deepEqual(result.dependencies, expected);

  const resolvers = new Map([
    ["custom", "file:\\file.js"]
  ]);
  tape.deepEqual(result.customResolvers, resolvers);

  tape.end();
});

test("should return no dependencies/customResolvers for three.json", (tape) => {
  const result = mergeDependencies(three, ["dependencies", "devDependencies"]);
  tape.true(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  tape.strictEqual(result.dependencies.size, 0);
  tape.strictEqual(result.customResolvers.size, 0);

  tape.end();
});

test("should detect NPM alias using custom resolvers npm: (but still count it as normal dependency)", (tape) => {
  const result = mergeDependencies({
    dependencies: {
      test: "npm:fastify@^4.7.0"
    }
  }, ["dependencies", "devDependencies"]);
  tape.true(is.plainObject(result), "result value of mergeDependencies must be a plainObject.");

  tape.strictEqual(result.dependencies.size, 1);
  tape.strictEqual(result.customResolvers.size, 1);
  tape.true(result.alias.has("test"));
  tape.strictEqual(result.alias.get("test"), "fastify@^4.7.0");

  tape.end();
});
