// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import semver from "semver";
import is from "@slimio/is";

// Import Internal Dependencies
import { Logger, type Dependency } from "../src/index.js";
import * as registry from "../src/npmRegistry.js";

test("registry.packageMetadata should not throw error for unknown/invalid package", async() => {
  const logger = new Logger().start("registry");

  await registry.packageMetadata("foobarrxldkedeoxcjek", "1.5.0", {
    logger,
    dependency: {} as any
  });
});

test("registry.manifestMetadata should not throw error for unknown/invalid package", async() => {
  await registry.manifestMetadata("foobarrxldkedeoxcjek", "1.5.0", {});
});

test("registry.manifestMetadata", async() => {
  const dep = {
    metadata: {
      integrity: {}
    },
    versions: {
      "1.5.0": {}
    }
  };

  await registry.manifestMetadata("@slimio/is", "1.5.0", dep);
  assert.equal(Object.keys(dep.metadata).length, 1);
  assert.deepEqual(dep.metadata, {
    integrity: {
      "1.5.0": "0df0f03a28f621111c667e3b50db97a24abf5c02"
    }
  });
  assert.deepEqual(dep.versions["1.5.0"], {
    links: {
      npm: "https://www.npmjs.com/package/@slimio/is/v/1.5.0",
      homepage: "https://github.com/SlimIO/is#readme",
      repository: "https://github.com/SlimIO/is"
    }
  });
});

test("registry.packageMetadata", async() => {
  const dependency = {
    metadata: {},
    versions: {
      "1.5.0": {
        flags: []
      }
    }
  } as unknown as Dependency;
  const logger = new Logger().start("registry");

  await registry.packageMetadata("@slimio/is", "1.5.0", {
    dependency,
    logger
  });

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

test("registry.packageMetadata should find GitLab links", async() => {
  const dependency = {
    metadata: {},
    versions: {
      "71.2.0": {
        flags: []
      }
    }
  } as unknown as Dependency;
  const logger = new Logger().start("registry");

  await registry.packageMetadata("@gitlab/ui", "71.2.0", {
    dependency,
    logger
  });

  assert.deepEqual(dependency.versions["71.2.0"]!.links, {
    npm: "https://www.npmjs.com/package/@gitlab/ui/v/71.2.0",
    homepage: "https://gitlab.com/gitlab-org/gitlab-ui#readme",
    repository: "https://gitlab.com/gitlab-org/gitlab-ui"
  });
});

test("registry.packageMetadata should detect a deprecated package", async() => {
  const dependency = {
    metadata: {},
    versions: {
      "2.5.9": {
        flags: []
      }
    }
  } as unknown as Dependency;
  const logger = new Logger().start("registry");

  await registry.packageMetadata("express", "2.5.9", {
    dependency,
    logger
  });

  assert.deepEqual(dependency.versions["2.5.9"]!.flags, [
    "isOutdated",
    "isDeprecated"
  ]);
});
