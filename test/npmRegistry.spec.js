// Import Node.js Dependencies
import { describe, it, after } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import semver from "semver";
import is from "@slimio/is";

// Import Internal Dependencies
import Logger from "../src/class/logger.class.js";
import * as registry from "../src/npmRegistry.js";

describe("npmRegistry", () => {
  it("registry.parseAuthor should be able to parse an author string", () => {
    const result = registry.parseAuthor("GENTILHOMME Thomas");
    assert.deepEqual(result, { name: "GENTILHOMME Thomas" });
  });

  it("registry.parseAuthor should return value if not a string", () => {
    const result = registry.parseAuthor({});
    assert.deepEqual(result, {});
  });

  it("registry.packageMetadata should not throw error", async() => {
    const logger = new Logger().start("registry");

    await registry.packageMetadata("@slimio/is", "1.5.0", { logger });
  });

  it("registry.packageMetadata", async() => {
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
  });
});
