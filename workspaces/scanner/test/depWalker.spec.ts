// Import Node.js Dependencies
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import * as Vulnera from "@nodesecure/vulnera";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { depWalker } from "../src/depWalker.js";
import { from, type Payload, type DependencyVersion } from "../src/index.js";

// CONSTANTS
const FIXTURE_PATH = join("fixtures", "depWalker");

// JSON PAYLOADS
const is = JSON.parse(readFileSync(
  new URL(join(FIXTURE_PATH, "slimio.is.json"), import.meta.url),
  "utf8"
));

const config = JSON.parse(readFileSync(
  new URL(join(FIXTURE_PATH, "slimio.config.json"), import.meta.url),
  "utf8"
));

const pkgGitdeps = JSON.parse(readFileSync(
  new URL(join(FIXTURE_PATH, "pkg.gitdeps.json"), import.meta.url),
  "utf8"
));

function cleanupPayload(payload: Payload) {
  for (const pkg of Object.values(payload)) {
    const versions = Object.values(
      pkg.versions
    ) as DependencyVersion[];

    for (const verDescriptor of versions) {
      verDescriptor.composition.extensions.sort();
      // @ts-ignore
      delete verDescriptor.size;
      // @ts-ignore
      delete verDescriptor.composition.files;
      // @ts-ignore
      delete verDescriptor.composition.required_files;
    }
    for (const contributor of [pkg.metadata.author, ...pkg.metadata.publishers, ...pkg.metadata.maintainers]) {
      // this is a dynamic property
      delete contributor.npmAvatar;
    }
  }
}

test("execute depWalker on @slimio/is", async() => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);

  const result = await depWalker(is, {
    registry: getLocalRegistryURL()
  });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));
  cleanupPayload(resultAsJSON);

  const expectedResult = JSON.parse(readFileSync(join("test", FIXTURE_PATH, "slimio.is-result.json"), "utf-8"));
  // console.log(JSON.stringify(resultAsJSON, null, 2));
  assert.deepEqual(resultAsJSON, expectedResult);
});

test("execute depWalker on @slimio/config", async() => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);

  const result = await depWalker(config, {
    registry: getLocalRegistryURL()
  });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));

  const packages = Object.keys(resultAsJSON).sort();
  assert.deepEqual(packages, [
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

  const ajvDescriptor = resultAsJSON.ajv.versions["6.12.6"];
  const ajvUsedBy = Object.keys(ajvDescriptor.usedBy);
  assert.deepEqual(ajvUsedBy, [
    "@slimio/config"
  ]);
});

test("execute depWalker on pkg.gitdeps", async() => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);

  const result = await depWalker(pkgGitdeps, {
    registry: getLocalRegistryURL()
  });
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));

  const packages = Object.keys(resultAsJSON).sort();
  assert.deepEqual(packages, [
    "@nodesecure/estree-ast-utils",
    "@nodesecure/js-x-ray",
    "@nodesecure/sec-literal",
    "@types/estree",
    "ansi-regex",
    "digraph-js",
    "eastasianwidth",
    "emoji-regex",
    "estree-walker",
    "fast-xml-parser",
    "frequency-set",
    "is-base64",
    "is-minified-code",
    "is-svg",
    "lodash.isequal",
    "lodash.uniqwith",
    "meriyah",
    "nanodelay",
    "nanoevents",
    "nanoid",
    "pkg.gitdeps",
    "regexp-tree",
    "safe-regex",
    "string-width",
    "strip-ansi",
    "strnum",
    "ts-pattern",
    "zen-observable"
  ].sort());
});

test("fetch payload of pacote on the npm registry", async() => {
  const result = await from("pacote", {
    maxDepth: 10,
    vulnerabilityStrategy: Vulnera.strategies.GITHUB_ADVISORY
  });

  assert.deepEqual(Object.keys(result), [
    "id",
    "rootDependencyName",
    "scannerVersion",
    "vulnerabilityStrategy",
    "warnings",
    "highlighted",
    "dependencies"
  ]);
});

test("fetch payload of pacote on the gitlab registry", async() => {
  const result = await from("pacote", {
    registry: "https://gitlab.com/api/v4/packages/npm/",
    maxDepth: 10,
    vulnerabilityStrategy: Vulnera.strategies.GITHUB_ADVISORY
  });

  assert.deepEqual(Object.keys(result), [
    "id",
    "rootDependencyName",
    "scannerVersion",
    "vulnerabilityStrategy",
    "warnings",
    "highlighted",
    "dependencies"
  ]);
});

test("highlight contacts from a remote package", async() => {
  const spec = "@adonisjs/logger";
  const result = await from(spec, {
    highlight: {
      contacts: [
        {
          name: "/.*virk.*/i"
        }
      ]
    }
  });

  assert.ok(result.highlighted.contacts.length > 0);
  const maintainer = result.highlighted.contacts[0]!;
  assert.ok(
    maintainer.dependencies.includes(spec)
  );
});
