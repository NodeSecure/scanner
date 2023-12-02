// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import semver from "semver";
import is from "@slimio/is";

// Import Internal Dependencies
import Logger from "../src/class/logger.class.js";
import * as registry from "../src/npmRegistry.js";

test("registry.packageMetadata should not throw error for unknown/invalid package", async() => {
  const logger = new Logger().start("registry");

  await registry.packageMetadata("foobarrxldkedeoxcjek", "1.5.0", { logger });
});

test("registry.manifestMetadata should not throw error for unknown/invalid package", async() => {
  await registry.manifestMetadata("foobarrxldkedeoxcjek", "1.5.0", {});
});

test("registry.manifestMetadata", async() => {
  const metadata = {
    integrity: {}
  };

  await registry.manifestMetadata("@slimio/is", "1.5.0", metadata);
  assert.equal(Object.keys(metadata).length, 1);
  assert.deepEqual(metadata, {
    integrity: {
      "1.5.0": "d9cdfeeddb9e5cadfa4188942b4456e2a9c2f60787e772e59394076711ebb9e1"
    }
  });
});

test("registry.packageMetadata", async() => {
  const ref = {
    metadata: {},
    versions: {
      "1.5.0": {
        flags: []
      }
    }
  };
  const logger = new Logger().start("registry");

  await registry.packageMetadata("@slimio/is", "1.5.0", {
    ref,
    logger
  });

  assert.deepEqual(ref.versions["1.5.0"].flags, ["isOutdated"]);
  assert.strictEqual(logger.count("registry"), 1);

  assert.deepEqual(ref.metadata.author, { name: "SlimIO" });
  assert.strictEqual(ref.metadata.homepage, "https://github.com/SlimIO/is#readme");
  assert.ok(semver.gt(ref.metadata.lastVersion, "1.5.0"));

  assert.ok(Array.isArray(ref.metadata.publishers));
  assert.ok(Array.isArray(ref.metadata.maintainers));
  assert.ok(ref.metadata.publishers.length > 0);
  assert.ok(ref.metadata.maintainers.length > 0);

  assert.ok(ref.metadata.hasManyPublishers);
  assert.ok(typeof ref.metadata.publishedCount === "number");
  assert.ok(is.date(new Date(ref.metadata.lastUpdateAt)));

  assert.deepEqual(ref.versions["1.5.0"].links, {
    npm: "https://www.npmjs.com/package/@slimio/is/v/1.5.0",
    homepage: "https://github.com/SlimIO/is#readme",
    repository: "https://github.com/SlimIO/is"
  });
});

test("registry.packageMetadata should find GitLab links", async() => {
  const ref = {
    metadata: {},
    versions: {
      "71.2.0": {
        flags: []
      }
    }
  };
  const logger = new Logger().start("registry");

  await registry.packageMetadata("@gitlab/ui", "71.2.0", {
    ref,
    logger
  });

  assert.deepEqual(ref.versions["71.2.0"].links, {
    npm: "https://www.npmjs.com/package/@gitlab/ui/v/71.2.0",
    homepage: "https://gitlab.com/gitlab-org/gitlab-ui#readme",
    repository: "https://gitlab.com/gitlab-org/gitlab-ui"
  });
});
