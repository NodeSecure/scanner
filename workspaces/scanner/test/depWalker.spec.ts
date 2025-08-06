// Import Node.js Dependencies
import path from "node:path";
import url from "node:url";
import { readFileSync } from "node:fs";
import { test, describe } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import * as Vulnera from "@nodesecure/vulnera";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { depWalker } from "../src/depWalker.js";
import { from, type Payload, type DependencyVersion, cwd } from "../src/index.js";

// CONSTANTS
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "fixtures", "depWalker");

// JSON PAYLOADS
const is = JSON.parse(readFileSync(
  path.join(kFixturePath, "slimio.is.json"),
  "utf8"
));

const config = JSON.parse(readFileSync(
  path.join(kFixturePath, "slimio.config.json"),
  "utf8"
));

const pkgGitdeps = JSON.parse(readFileSync(
  path.join(kFixturePath, "pkg.gitdeps.json"),
  "utf8"
));

const pkgTypoSquatting = JSON.parse(readFileSync(
  path.join(kFixturePath, "typo-squatting.json"),
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

  const expectedResult = JSON.parse(readFileSync(path.join(kFixturePath, "slimio.is-result.json"), "utf-8"));
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
    "@myunisoft/httpie",
    "@nodesecure/npm-registry-sdk",
    "@nodesecure/npm-types",
    "@openally/result",
    "content-type",
    "lru-cache",
    "nanodelay",
    "nanoevents",
    "nanoid",
    "pkg.gitdeps",
    "statuses",
    "undici",
    "zen-observable"
  ].sort());
});

test("execute depWalker on typo-squatting", async() => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);

  const result = await depWalker(pkgTypoSquatting, {
    registry: getLocalRegistryURL()
  });

  assert.deepEqual(result.warnings, [
    "The package 'mecha' is similar to the following popular packages: fecha, mocha"
  ]);
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

describe("scanner.cwd()", () => {
  test("should parse author, homepage and links for a local package who doesn't exist on the remote registry", async() => {
    const result = await cwd(path.join(kFixturePath, "non-npm-package"));

    const dep = result.dependencies["non-npm-package"];
    const v1 = dep.versions["1.0.0"];

    assert.deepEqual(v1.author, {
      name: "NodeSecure"
    });
    assert.deepStrictEqual(v1.links, {
      npm: null,
      homepage: "https://nodesecure.com",
      repository: "https://github.com/NodeSecure/non-npm-package"
    });
    assert.deepStrictEqual(v1.repository, {
      type: "git",
      url: "https://github.com/NodeSecure/non-npm-package.git"
    });

    assert.deepStrictEqual(dep.metadata.author, {
      name: "NodeSecure"
    });
    assert.strictEqual(dep.metadata.homepage, "https://nodesecure.com");
  });

  test("should parse local manifest author field without throwing when attempting to highlight contacts", async() => {
    const { dependencies } = await cwd(
      path.join(kFixturePath, "non-valid-authors")
    );
    const pkg = dependencies["random-package"];

    assert.deepEqual(pkg.metadata.author, {
      email: "john.doe@gmail.com",
      name: "John Doe"
    });
  });

  test("should scan a workspace package.json and assign 'workspace' as the package name", async() => {
    const result = await cwd(
      path.join(kFixturePath, "workspace-no-name-version")
    );

    assert.strictEqual(result.rootDependencyName, "workspace");
  });
});

