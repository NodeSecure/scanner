// Require Node.js Dependencies
import { join } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

// Third party Dependencies
import { setStrategy, strategies } from "@nodesecure/vuln";
import test from "tape";
import snapshot from "snap-shot-core";

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

test.onFinish(snapshot.restore);

test("execute depWalker on @slimio/is", async(tape) => {
  await setStrategy(strategies.NPM_AUDIT);

  const result = await depWalker(is, { verbose: false });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));
  cleanupPayload(resultAsJSON);

  const what = JSON.stringify(resultAsJSON);
  const out = snapshot.core({
    what,
    file: fileURLToPath(import.meta.url),
    specName: "walk @slimio/is"
  });
  tape.deepEqual(out.value, what, "must match snapshot value for 'walk @slimio/is'");

  tape.end();
});

test("execute depWalker on @slimio/config", async(tape) => {
  await setStrategy(strategies.NPM_AUDIT);

  const result = await depWalker(config, { verbose: false });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));

  const packages = Object.keys(resultAsJSON).sort();
  tape.deepEqual(packages, [
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

  tape.end();
});

test("fetch payload of pacote on the npm registry", async(tape) => {
  tape.teardown(snapshot.restore);

  const result = await from("pacote", { verbose: false, maxDepth: 10, vulnerabilityStrategy: strategies.NPM_AUDIT });
  const what = JSON.stringify(Object.keys(result));

  const out = snapshot.core({
    what,
    file: fileURLToPath(import.meta.url),
    specName: "from pacote"
  });
  tape.deepEqual(out.value, what, "must match snapshot value for 'from pacote'");

  tape.end();
});
