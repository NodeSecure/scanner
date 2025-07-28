// Import Node.js Dependencies
import { test, describe } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import semver from "semver";
import is from "@slimio/is";

// Import Internal Dependencies
import { Logger, type Dependency } from "../src/index.js";
import { NpmRegistryProvider } from "../src/registry/NpmRegistryProvider.js";

describe("NpmRegistryProvider", () => {
  describe("enrichDependencyVersion", () => {
    test("should not throw error when package does not exist", async() => {
      const provider = new NpmRegistryProvider("foobarrxldkedeoxcjek", "1.5.0");

      await provider.enrichDependencyVersion({} as any);
    });

    test("should enrich dependency with manifest metadata and links for valid package", async() => {
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      };
      const provider = new NpmRegistryProvider("@slimio/is", "1.5.0");

      await provider.enrichDependencyVersion(dep as any);

      assert.equal(Object.keys(dep.metadata).length, 1);
      assert.deepEqual(dep.metadata, {
        integrity: {
          "1.5.0": "0df0f03a28f621111c667e3b50db97a24abf5c02"
        }
      });
      assert.deepEqual(dep.versions["1.5.0"], {
        deprecated: undefined,
        links: {
          npm: "https://www.npmjs.com/package/@slimio/is/v/1.5.0",
          homepage: "https://github.com/SlimIO/is#readme",
          repository: "https://github.com/SlimIO/is"
        }
      });
    });
  });

  describe("enrichDependency", () => {
    test("should not throw error when package does not exist", async() => {
      const logger = new Logger().start("registry");
      const provider = new NpmRegistryProvider("foobarrxldkedeoxcjek", "1.5.0");

      await provider.enrichDependency(logger, {} as any);
    });

    test("should enrich dependency with complete package metadata for valid package", async() => {
      const dependency = {
        metadata: {},
        versions: {
          "1.5.0": {
            flags: []
          }
        }
      } as unknown as Dependency;
      const logger = new Logger().start("registry");
      const provider = new NpmRegistryProvider("@slimio/is", "1.5.0");

      await provider.enrichDependency(logger, dependency);

      assert.deepEqual(dependency.versions["1.5.0"]!.flags, ["isOutdated"]);
      assert.strictEqual(logger.count("registry"), 1);

      assert.strictEqual(dependency.metadata.author!.name, "SlimIO");
      assert.strictEqual(dependency.metadata.homepage, "https://github.com/SlimIO/is#readme");
      assert.ok(semver.gt(dependency.metadata.lastVersion, "1.5.0"));

      assert.ok(Array.isArray(dependency.metadata.publishers));
      assert.ok(Array.isArray(dependency.metadata.maintainers));
      assert.ok(dependency.metadata.publishers.length > 0);
      assert.ok(dependency.metadata.maintainers.length > 0);

      assert.ok(dependency.metadata.hasManyPublishers);
      assert.ok(typeof dependency.metadata.publishedCount === "number");
      assert.ok(is.date(new Date(dependency.metadata.lastUpdateAt)));

      assert.deepEqual(dependency.versions["1.5.0"]!.links, {
        npm: "https://www.npmjs.com/package/@slimio/is/v/1.5.0",
        homepage: "https://github.com/SlimIO/is#readme",
        repository: "https://github.com/SlimIO/is"
      });
    });

    test("should extract GitLab repository links when package is hosted on GitLab", async() => {
      const dependency = {
        metadata: {},
        versions: {
          "71.2.0": {
            flags: []
          }
        }
      } as unknown as Dependency;
      const logger = new Logger().start("registry");
      const provider = new NpmRegistryProvider("@gitlab/ui", "71.2.0");

      await provider.enrichDependency(logger, dependency);

      assert.deepEqual(dependency.versions["71.2.0"]!.links, {
        npm: "https://www.npmjs.com/package/@gitlab/ui/v/71.2.0",
        homepage: "https://gitlab.com/gitlab-org/gitlab-ui#readme",
        repository: "https://gitlab.com/gitlab-org/gitlab-ui"
      });
    });

    test("should detect and flag deprecated package versions", async() => {
      const dependency = {
        metadata: {},
        versions: {
          "2.5.9": {
            flags: []
          }
        }
      } as unknown as Dependency;
      const logger = new Logger().start("registry");
      const provider = new NpmRegistryProvider("express", "2.5.9");

      await provider.enrichDependency(logger, dependency);

      assert.deepEqual(dependency.versions["2.5.9"]!.flags, [
        "isOutdated",
        "isDeprecated"
      ]);

      assert.strictEqual(dependency.versions["2.5.9"].deprecated, "express 2.x series is deprecated");
    });
  });
});
