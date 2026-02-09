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
import { depWalker } from "../src/depWalker.ts";
import {
  Logger,
  from,
  workingDir,
  type Payload,
  type DependencyVersion,
  type Identifier
} from "../src/index.ts";

// CONSTANTS
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "fixtures", "depWalker");
const kDefaultWalkerOptions = {
  registry: getLocalRegistryURL()
};

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

const pkgHighlightedPackages = JSON.parse(readFileSync(
  path.join(kFixturePath, "highlighted-packages.json"),
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

test("execute depWalker on @slimio/is", async(test) => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
  const { logger, errorCount } = errorLogger();
  test.after(() => logger.removeAllListeners());

  const result = await depWalker(
    is,
    structuredClone(kDefaultWalkerOptions),
    logger
  );
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));
  cleanupPayload(resultAsJSON);

  const expectedResult = JSON.parse(readFileSync(path.join(kFixturePath, "slimio.is-result.json"), "utf-8"));
  assert.deepEqual(resultAsJSON, expectedResult);
  assert.strictEqual(errorCount(), 0);
});

test("execute depWalker on @slimio/config", async(test) => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
  const { logger, errorCount } = errorLogger();
  test.after(() => logger.removeAllListeners());

  const result = await depWalker(
    config,
    structuredClone(kDefaultWalkerOptions),
    logger
  );
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
  assert.strictEqual(errorCount(), 0);
});

test("execute depWalker on pkg.gitdeps", async(test) => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
  const { logger, errors } = errorLogger();
  test.after(() => logger.removeAllListeners());

  const result = await depWalker(
    pkgGitdeps,
    structuredClone(kDefaultWalkerOptions),
    logger
  );
  const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));

  const packages = Object.keys(resultAsJSON).sort();
  assert.deepEqual(packages, [
    "@nodesecure/npm-registry-sdk",
    "@nodesecure/npm-types",
    "@openally/httpie",
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

  const walkErrors = errors();

  assert.deepStrictEqual(walkErrors, [
    {
      error: "404 Not Found - GET https://registry.npmjs.org/pkg.gitdeps - Not found",
      phase: "tarball-scan"
    }
  ]);
  const { metadata } = result;
  assert.strictEqual(typeof metadata.startedAt, "number");
  assert.strictEqual(typeof metadata.executionTime, "number");
  assert.strictEqual(Array.isArray(metadata.apiCalls), true);
  assert.strictEqual(metadata.apiCallsCount, 50);
  assert.strictEqual(metadata.errorCount, 2);
  assert.strictEqual(metadata.errors.length, 2);
});

test("execute depWalker on typo-squatting (with location)", async(test) => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
  const { logger, errors } = errorLogger();
  test.after(() => logger.removeAllListeners());

  const result = await depWalker(
    pkgTypoSquatting,
    {
      ...structuredClone(kDefaultWalkerOptions),
      location: ""
    },
    logger
  );

  assert.ok(result.warnings.length > 0);
  const warning = result.warnings[0];

  assert.equal(warning.type, "typo-squatting");
  assert.strictEqual(
    result.warnings[0].message,
    "Dependency 'mecha' is similar to the following popular packages: fecha, mocha"
  );

  const walkErrors = errors();
  assert.deepStrictEqual(walkErrors, [
    {
      error: "No matching version found for mecha@1.0.0.",
      phase: "tarball-scan"
    }
  ]);
});

test("execute depWalker on typo-squatting (with no location)", async(test) => {
  Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
  const { logger, errors } = errorLogger();
  test.after(() => logger.removeAllListeners());

  const result = await depWalker(
    pkgTypoSquatting,
    structuredClone(kDefaultWalkerOptions),
    logger
  );

  assert.ok(result.warnings.length === 0);
  const walkErrors = errors();
  assert.deepStrictEqual(walkErrors, [
    {
      error: "No matching version found for mecha@1.0.0.",
      phase: "tarball-scan"
    }
  ]);
});

test("should highlight the given packages", async() => {
  const { logger } = errorLogger();
  test.after(() => logger.removeAllListeners());

  const hightlightPackages = {
    "zen-observable": "0.8.14 || 0.8.15",
    nanoid: "*"
  };

  const result = await depWalker(
    pkgHighlightedPackages,
    structuredClone({
      ...kDefaultWalkerOptions,
      highlight: {
        packages: hightlightPackages,
        contacts: []
      }
    }),
    logger
  );

  assert.deepStrictEqual(
    result.highlighted.packages.sort(),
    [
      "nanoid@5.1.6",
      "zen-observable@0.8.15"
    ]
  );
});

test("should support multiple formats for packages highlighted", async() => {
  const { logger } = errorLogger();
  test.after(() => logger.removeAllListeners());

  const hightlightPackages = ["zen-observable@0.8.14 || 0.8.15", "nanoid"];

  const result = await depWalker(
    pkgHighlightedPackages,
    structuredClone({
      ...kDefaultWalkerOptions,
      highlight: {
        packages: hightlightPackages,
        contacts: []
      }
    }),
    logger
  );

  assert.deepStrictEqual(
    result.highlighted.packages.sort(),
    [
      "nanoid@5.1.6",
      "zen-observable@0.8.15"
    ]
  );
});

test("fetch payload of pacote on the npm registry", async() => {
  const result = await from(
    "pacote",
    {
      maxDepth: 10,
      vulnerabilityStrategy: Vulnera.strategies.GITHUB_ADVISORY
    }
  );

  assert.deepEqual(Object.keys(result), [
    "id",
    "rootDependency",
    "scannerVersion",
    "vulnerabilityStrategy",
    "warnings",
    "highlighted",
    "dependencies",
    "metadata"
  ]);
  assert.strictEqual(typeof result.rootDependency.integrity, "string");
});

test("fetch payload of pacote on the gitlab registry", async() => {
  const result = await from("pacote", {
    registry: "https://gitlab.com/api/v4/packages/npm/",
    maxDepth: 10,
    vulnerabilityStrategy: Vulnera.strategies.GITHUB_ADVISORY
  });

  assert.deepEqual(Object.keys(result), [
    "id",
    "rootDependency",
    "scannerVersion",
    "vulnerabilityStrategy",
    "warnings",
    "highlighted",
    "dependencies",
    "metadata"
  ]);
  assert.strictEqual(typeof result.rootDependency.integrity, "string");
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
    const file = path.join(kFixturePath, "non-npm-package");
    const result = await workingDir(file, {
      highlight: {
        identifiers: ["foobar@gmail.com", "https://foobar.com/something", "foobar.com", "127.0.0.1"]
      },
      scanRootNode: true
    });

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
    assert.strictEqual(typeof result.rootDependency.integrity, "string");
    const spec = "non-npm-package@1.0.0";
    assert.partialDeepStrictEqual(sortIdentifiers(result.highlighted.identifiers), sortIdentifiers([
      {
        value: "foobar@gmail.com",
        spec,
        location: {
          file
        }
      },
      {
        value: "foobar@gmail.com",
        spec,
        location: {
          file: path.join(file, "email")
        }
      },
      {
        value: "https://foobar.com/something",
        spec,
        location: {
          file
        }
      },
      {
        value: "foobar.com",
        spec,
        location: {
          file
        }
      },
      {
        value: "127.0.0.1",
        spec,
        location: {
          file
        }
      }
    ]));
  });

  test("should parse local manifest author field without throwing when attempting to highlight contacts", async() => {
    const { dependencies } = await workingDir(
      path.join(kFixturePath, "non-valid-authors")
    );
    const pkg = dependencies["random-package"];

    assert.deepEqual(pkg.metadata.author, {
      email: "john.doe@gmail.com",
      name: "John Doe"
    });
  });

  test("should scan a workspace package.json and assign 'workspace' as the package name", async() => {
    const result = await workingDir(
      path.join(kFixturePath, "workspace-no-name-version")
    );

    assert.deepStrictEqual(result.rootDependency, {
      name: "workspace",
      version: "0.0.0",
      integrity: null
    });
  });
});

type PartialIdentifer = Omit<Identifier, "location"> & { location: { file: string | null; }; };

function sortIdentifiers(identifiers: PartialIdentifer[]) {
  return identifiers.slice().sort((a, b) => uniqueIdenfier(a).localeCompare(uniqueIdenfier(b)));
}

function uniqueIdenfier(identifer: PartialIdentifer) {
  return `${identifer.value} ${identifer.location.file}`;
}

function errorLogger() {
  const errors: ({ error: string; phase: string | undefined; })[] = [];

  const logger = new Logger();
  logger.on("error", (error, phase) => {
    errors.push({ error: error.message, phase });
  });

  return {
    logger,
    errorCount: () => errors.length,
    errors: () => errors
  };
}
