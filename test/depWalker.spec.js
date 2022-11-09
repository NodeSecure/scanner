// Require Node.js Dependencies
import { join, dirname } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

// Third party Dependencies
import { setStrategy, strategies } from "@nodesecure/vuln";
import test from "tape";
import snapshot from "snap-shot-core";

// Require Internal Dependencies
import { depWalker } from "../src/depWalker.js";
import { from, cwd } from "../index.js";

// CONSTANTS
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join("fixtures", "depWalker");

// JSON PAYLOADS
const is = JSON.parse(readFileSync(
  new URL(join(FIXTURE_PATH, "slimio.is.json"), import.meta.url)
));

const config = JSON.parse(readFileSync(
  new URL(join(FIXTURE_PATH, "slimio.config.json"), import.meta.url)
));

const pkgGitdeps = JSON.parse(readFileSync(
  new URL(join(FIXTURE_PATH, "pkg.gitdeps.json"), import.meta.url)
));

function cleanupPayload(payload) {
  for (const pkg of Object.values(payload)) {
    for (const verDescriptor of Object.values(pkg.versions)) {
      verDescriptor.composition.extensions.sort();
      delete verDescriptor.size;
      delete verDescriptor.composition.files;
      delete verDescriptor.composition.required_files;
    }
  }
}

test.onFinish(snapshot.restore);

test("execute depWalker on @slimio/is", async(tape) => {
  await setStrategy(strategies.NPM_AUDIT);

  const result = await depWalker(is, { verbose: false });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));
  cleanupPayload(resultAsJSON);

  snapshot.core({
    what: resultAsJSON,
    file: fileURLToPath(import.meta.url),
    specName: "walk @slimio/is"
  });

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

test("execute depWalker on pkg.gitdeps", async(tape) => {
  await setStrategy(strategies.NPM_AUDIT);

  const result = await depWalker(pkgGitdeps, { verbose: false });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));

  const packages = Object.keys(resultAsJSON).sort();
  tape.deepEqual(packages, [
    "@nodesecure/estree-ast-utils",
    "@nodesecure/js-x-ray",
    "@nodesecure/sec-literal",
    "eastasianwidth",
    "emoji-regex",
    "estree-walker",
    "fast-xml-parser",
    "frequency-set",
    "is-base64",
    "is-minified-code",
    "is-svg",
    "meriyah",
    "nanodelay",
    "nanoevents",
    "nanoid",
    "pkg.gitdeps",
    "regexp-tree",
    "safe-regex",
    "string-width",
    "strip-ansi",
    "zen-observable"
  ].sort());

  tape.end();
});

test("fetch payload of pacote on the npm registry", async(tape) => {
  tape.teardown(snapshot.restore);

  const result = await from("pacote", {
    verbose: false,
    maxDepth: 10,
    vulnerabilityStrategy: strategies.NPM_AUDIT
  });
  snapshot.core({
    what: Object.keys(result),
    file: fileURLToPath(import.meta.url),
    specName: "from pacote"
  });

  tape.end();
});

test("fetch payload of pacote on the gitlab registry", async(tape) => {
  tape.teardown(snapshot.restore);

  const result = await from("pacote", {
    registry: "https://gitlab.com/api/v4/packages/npm/",
    verbose: false,
    maxDepth: 10,
    vulnerabilityStrategy: strategies.NPM_AUDIT
  });

  snapshot.core({
    what: Object.keys(result),
    file: fileURLToPath(import.meta.url),
    specName: "from pacote"
  });

  tape.end();
});

test("execute cwd on scanner project", async(tape) => {
  await cwd(join(__dirname, ".."), {
    verbose: false,
    maxDepth: 2,
    vulnerabilityStrategy: strategies.NPM_AUDIT
  });

  tape.end();
});

test("execute cwd on scanner project with a different registry", async(tape) => {
  await cwd(join(__dirname, ".."), {
    registry: "https://gitlab.com/api/v4/packages/npm/",
    verbose: false,
    maxDepth: 2,
    vulnerabilityStrategy: strategies.NPM_AUDIT
  });

  tape.end();
});
