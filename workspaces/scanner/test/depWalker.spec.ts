// Import Node.js Dependencies
import path from "node:path";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import * as Vulnera from "@nodesecure/vulnera";
import { ManifestManager } from "@nodesecure/mama";
import {
  getLocalRegistryURL
} from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { depWalker } from "../src/depWalker.ts";
import {
  Logger,
  type Payload,
  type DependencyVersion
} from "../src/index.ts";

// VARS
const skip = false;

// CONSTANTS
const kFixturePath = path.join(import.meta.dirname, "fixtures", "depWalker");
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

describe("depWalker", { concurrency: 2 }, () => {
  it("should resolve and match the full dependency tree of @slimio/is", { skip }, async(t) => {
    Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
    const { logger, errorCount } = buildLogger();
    t.after(() => logger.removeAllListeners());

    const result = await depWalker(
      new ManifestManager(is),
      structuredClone(kDefaultWalkerOptions),
      logger
    );
    const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));
    cleanupPayload(resultAsJSON);

    const expectedResult = JSON.parse(readFileSync(path.join(kFixturePath, "slimio.is-result.json"), "utf-8"));
    assert.deepEqual(resultAsJSON, expectedResult);
    assert.strictEqual(errorCount(), 0);
  });

  it("should resolve all packages and usedBy relations for @slimio/config", { skip }, async(t) => {
    Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
    const { logger, errorCount } = buildLogger();
    t.after(() => logger.removeAllListeners());

    const result = await depWalker(
      new ManifestManager(config),
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

    const ajvDescriptor = resultAsJSON.ajv.versions["6.14.0"];
    const ajvUsedBy = Object.keys(ajvDescriptor.usedBy);
    assert.deepEqual(ajvUsedBy, [
      "@slimio/config"
    ]);
    assert.strictEqual(errorCount(), 0);
  });

  it("should collect walk errors and metadata stats for unresolvable git dependencies", { skip }, async(t) => {
    Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
    const { logger, errors, statsCount } = buildLogger();
    t.after(() => logger.removeAllListeners());

    const result = await depWalker(
      new ManifestManager(pkgGitdeps),
      {
        ...structuredClone(kDefaultWalkerOptions),
        isVerbose: true
      },
      logger
    );
    const resultAsJSON = JSON.parse(JSON.stringify(result.dependencies, null, 2));

    const packages = Object.keys(resultAsJSON).sort();
    assert.deepEqual(packages, [
      "@nodesecure/npm-registry-sdk",
      "@nodesecure/npm-types",
      "@openally/httpie",
      "@openally/result",
      "lru-cache",
      "nanodelay",
      "nanoevents",
      "nanoid",
      "pkg.gitdeps",
      "undici",
      "zen-observable"
    ].sort());

    const walkErrors = errors();

    assert.deepStrictEqual(walkErrors, [
      {
        name: "pacote.manifest pkg.gitdeps@0.1.0",
        error: "404 Not Found - GET https://registry.npmjs.org/pkg.gitdeps - Not found",
        phase: "tree-walk"
      },
      {
        name: "pacote.extract pkg.gitdeps@0.1.0",
        error: "404 Not Found - GET https://registry.npmjs.org/pkg.gitdeps - Not found",
        phase: "tarball-scan"
      }
    ]);
    const { metadata } = result;
    assert.strictEqual(typeof metadata.startedAt, "number");
    assert.strictEqual(typeof metadata.executionTime, "number");
    assert.strictEqual(Array.isArray(metadata.apiCalls), true);
    assert.strictEqual(metadata.apiCallsCount, 42);
    assert.strictEqual(metadata.errorCount, 2);
    assert.strictEqual(metadata.errors.length, 2);
    assert.strictEqual(statsCount(), 40);
    assert.deepEqual(metadata.apiCalls.flatMap(({ name, tarball }) => (name.startsWith("tarball.scanDirOrArchive") ?
      [tarball] : [])).sort(byFilesCount),
    [{ path: "All", filesCount: 37 },
      { path: "EntryFileAnalyser", filesCount: 5 },
      { path: "EntryFileAnalyser", filesCount: 11 },
      { path: "EntryFileAnalyser", filesCount: 5 },
      { path: "NONE", filesCount: 3 },
      { path: "EntryFileAnalyser", filesCount: 6 },
      { path: "EntryFileAnalyser", filesCount: 17 },
      { path: "EntryFileAnalyser", filesCount: 47 },
      { path: "EntryFileAnalyser", filesCount: 67 },
      { path: "EntryFileAnalyser", filesCount: 210 }].sort(byFilesCount));
  });

  function byFilesCount<T extends { filesCount: number; } | undefined>(a: T, b: T) {
    if (a === undefined || b === undefined) {
      return 0;
    }

    return a.filesCount - b.filesCount;
  }

  describe("typo-squatting", () => {
    it("should emit a global warning when a location is provided", { skip }, async(t) => {
      Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
      const { logger, errors, statsCount } = buildLogger();
      t.after(() => logger.removeAllListeners());

      const result = await depWalker(
        new ManifestManager(pkgTypoSquatting),
        {
          ...structuredClone(kDefaultWalkerOptions),
          location: "",
          isVerbose: true
        },
        logger
      );

      assert.ok(result.warnings.length > 0);
      const warning = result.warnings[0];

      assert.equal(warning.type, "typo-squatting");
      assert.match(
        result.warnings[0].message,
        /.*'mecha'.*fecha, mocha/
      );

      const walkErrors = errors();
      assert.deepStrictEqual(walkErrors, [
        {
          name: "pacote.manifest mecha@1.0.0",
          error: "No matching version found for mecha@1.0.0.",
          phase: "tree-walk"
        },
        {
          name: "pacote.extract mecha@1.0.0",
          error: "No matching version found for mecha@1.0.0.",
          phase: "tarball-scan"
        }
      ]);
      assert.strictEqual(statsCount(), 0);
    });

    it("should not emit a global warning when no location is provided", { skip }, async(t) => {
      Vulnera.setStrategy(Vulnera.strategies.GITHUB_ADVISORY);
      const { logger, errors } = buildLogger();
      t.after(() => logger.removeAllListeners());

      const result = await depWalker(
        new ManifestManager(pkgTypoSquatting),
        {
          ...structuredClone(kDefaultWalkerOptions),
          isVerbose: true
        },
        logger
      );

      assert.ok(result.warnings.length === 0);
      const walkErrors = errors();
      assert.deepStrictEqual(walkErrors, [
        {
          name: "pacote.manifest mecha@1.0.0",
          error: "No matching version found for mecha@1.0.0.",
          phase: "tree-walk"
        },
        {
          name: "pacote.extract mecha@1.0.0",
          error: "No matching version found for mecha@1.0.0.",
          phase: "tarball-scan"
        }
      ]);
    });
  });

  describe("highlight", () => {
    it("should highlight packages matching a semver range map", { skip }, async(t) => {
      const { logger } = buildLogger();
      t.after(() => logger.removeAllListeners());

      const hightlightPackages = {
        "zen-observable": "0.8.14 || 0.8.15",
        nanoid: "*"
      };

      const result = await depWalker(
        new ManifestManager(pkgHighlightedPackages),
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

    it("should highlight packages from an array of specs", { skip }, async(t) => {
      const { logger } = buildLogger();
      t.after(() => logger.removeAllListeners());

      const hightlightPackages = ["zen-observable@0.8.14 || 0.8.15", "nanoid"];

      const result = await depWalker(
        new ManifestManager(pkgHighlightedPackages),
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
  });
});

function buildLogger() {
  const errors: ({
    name: string | undefined;
    error: string | undefined;
    phase: string | undefined;
  })[] = [];

  const stats: ({ name: string; })[] = [];

  const logger = new Logger();
  logger.on("error", (error, phase) => {
    errors.push({ name: error.name, error: error.message, phase });
  });

  logger.on("stat", (stat) => {
    stats.push({
      name: stat.name
    });
  });

  return {
    logger,
    errorCount: () => errors.length,
    statsCount: () => stats.length,
    errors: () => errors,
    stats: () => stats
  };
}
