// Import Third-party Dependencies
import test from "tape";
import semver from "semver";
import is from "@slimio/is";

// Import Internal Dependencies
import Logger from "../src/class/logger.class.js";
import * as registry from "../src/npmRegistry.js";

test("registry.parseAuthor should be able to parse an author string", (tape) => {
  const result = registry.parseAuthor("GENTILHOMME Thomas");
  tape.deepEqual(result, { name: "GENTILHOMME Thomas" });

  tape.end();
});

test("registry.parseAuthor should return value if not a string", (tape) => {
  const result = registry.parseAuthor({});
  tape.deepEqual(result, {});

  tape.end();
});

test("registry.packageMetadata should not throw error", async(tape) => {
  const logger = new Logger().start("registry");

  await registry.packageMetadata("@slimio/is", "1.5.0", { logger });

  tape.end();
});

test("registry.packageMetadata", async(tape) => {
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

  tape.deepEqual(ref.versions["1.5.0"].flags, ["isOutdated"]);
  tape.strictEqual(logger.count("registry"), 1);

  tape.deepEqual(ref.metadata.author, { name: "SlimIO" });
  tape.strictEqual(ref.metadata.homepage, "https://github.com/SlimIO/is#readme");
  tape.true(semver.gt(ref.metadata.lastVersion, "1.5.0"));

  tape.true(Array.isArray(ref.metadata.publishers));
  tape.true(Array.isArray(ref.metadata.maintainers));
  tape.true(ref.metadata.publishers.length > 0);
  tape.true(ref.metadata.maintainers.length > 0);

  tape.true(ref.metadata.hasManyPublishers);
  tape.true(typeof ref.metadata.publishedCount === "number");
  tape.true(is.date(new Date(ref.metadata.lastUpdateAt)));

  tape.end();
});
