// Require Node.js Dependencies
import { join } from "path";
import { readFileSync } from "fs";

// Third party Dependencies
import { setStrategy, strategies } from "@nodesecure/vuln";

// Require Internal Dependencies
import { depWalker } from "../src/depWalker.js";
import { from } from "../index.js";

// CONSTANTS
const FIXTURE_PATH = join("fixtures", "depWalker");

// JSON PAYLOADS
const is = JSON.parse(readFileSync(
  new URL(join(FIXTURE_PATH, "slimio.is.json"), import.meta.url)
));

const config = JSON.parse(readFileSync(
  new URL(join(FIXTURE_PATH, "slimio.config.json"), import.meta.url)
));

function cleanupPayload(payload) {
  for (const pkg of Object.values(payload)) {
    for (const versionName of pkg.versions) {
      pkg[versionName].composition.extensions.sort();
      delete pkg[versionName].size;
      delete pkg[versionName].composition.files;
      delete pkg[versionName].composition.required_files;
    }
  }
}

test("execute depWalker on @slimio/is", async() => {
  await setStrategy(strategies.NPM_AUDIT);

  const result = await depWalker(is, { verbose: false });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));
  cleanupPayload(resultAsJSON);

  expect(resultAsJSON).toMatchSnapshot();
});

test("execute depWalker on @slimio/config", async() => {
  await setStrategy(strategies.NPM_AUDIT);

  const result = await depWalker(config, { verbose: false });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));

  const packages = Object.keys(resultAsJSON).sort();
  expect(packages).toEqual([
    "lodash.clonedeep",
    "zen-observable",
    "lodash.set",
    "lodash.get",
    "node-watch",
    "fast-deep-equal",
    "fast-json-stable-stringify",
    "json-schema-traverse",
    "punycode",
    "uri-js",
    "ajv",
    "@slimio/is",
    "@iarna/toml",
    "@slimio/config"
  ].sort());
});

test("fetch payload of pacote on the npm registry", async() => {
  const result = await from("pacote", { verbose: false, maxDepth: 10, vulnerabilityStrategy: strategies.NPM_AUDIT });
  expect(Object.keys(result)).toMatchSnapshot();
});
