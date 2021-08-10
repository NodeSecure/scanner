// Require Node.js Dependencies
import { join } from "path";
import { readFileSync } from "fs";

// Require Third-party Dependencies
import is from "@slimio/is";

// Require Internal Dependencies
import { mergeDependencies, getDirNameFromUrl } from "../../src/utils/index.js";

// CONSTANTS
const currentDirname = getDirNameFromUrl(import.meta.url);
const FIXTURE_PATH = join(currentDirname, "..", "fixtures/mergeDependencies");

// JSON PAYLOADS
const one = JSON.parse(readFileSync(join(FIXTURE_PATH, "one.json"), "utf-8"));
const two = JSON.parse(readFileSync(join(FIXTURE_PATH, "two.json"), "utf-8"));
const three = JSON.parse(readFileSync(join(FIXTURE_PATH, "three.json"), "utf-8"));

test("should return the one.json field 'dependencies' merged", () => {
  const result = mergeDependencies(one);

  expect(is.plainObject(result)).toStrictEqual(true);
  expect(result.dependencies).toMatchObject(new Map([
    ["semver", "^0.1.0"],
    ["test", "~0.5.0"]
  ]));
  expect(result.customResolvers).toMatchObject(new Map());
});

test("should return the one.json field 'dependencies' & 'devDependencies' merged", () => {
  const result = mergeDependencies(one, ["dependencies", "devDependencies"]);

  expect(is.plainObject(result)).toStrictEqual(true);
  expect(result.dependencies).toMatchObject(new Map([
    ["semver", "^0.1.0"],
    ["test", "~0.5.0"],
    ["ava", "^1.0.0"]
  ]));
  expect(result.customResolvers).toMatchObject(new Map());
});

test("should return two.json 'dependencies' & 'devDependencies' merged (with a custom Resolvers)", () => {
  const result = mergeDependencies(two, ["dependencies", "devDependencies"]);
  const resolvers = new Map([
    ["custom", "file:\\file.js"]
  ]);

  expect(is.plainObject(result)).toStrictEqual(true);
  expect(result.dependencies).toMatchObject(new Map([
    ["@slimio/is", "^1.4.0"],
    ["japa", "~0.1.0"]
  ]));
  expect(result.customResolvers).toMatchObject(resolvers);
});

test("should return no dependencies/customResolvers for three.json", () => {
  const result = mergeDependencies(three, ["dependencies", "devDependencies"]);

  expect(is.plainObject(result)).toStrictEqual(true);
  expect(result.dependencies.size).toStrictEqual(0);
  expect(result.customResolvers.size).toStrictEqual(0);
});
