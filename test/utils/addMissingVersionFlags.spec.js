// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { addMissingVersionFlags } from "../../src/utils/index.js";

test("addMissingVersionFlags should return all missing flags", (tape) => {
  const flags = new Set([
    "hasOutdatedDependency"
  ]);
  const gen = addMissingVersionFlags(flags, {
    metadata: {
      hasReceivedUpdateInOneYear: false,
      hasManyPublishers: true,
      hasChangedAuthor: true
    },
    vulnerabilities: [{}],
    versions: ["1.1.1", "1.5.0"]
  });
  const resultFlags = [...gen];
  tape.deepEqual(resultFlags, [
    "isDead", "hasManyPublishers", "hasChangedAuthor", "hasVulnerabilities", "hasDuplicate"
  ]);

  tape.end();
});

test("addMissingVersionFlags should return an empty array", (tape) => {
  const flags = new Set([
    "hasOutdatedDependency", "isDead", "hasManyPublishers", "hasChangedAuthor", "hasVulnerabilities", "hasDuplicate"
  ]);
  const gen = addMissingVersionFlags(flags, {
    metadata: {
      hasReceivedUpdateInOneYear: false,
      hasManyPublishers: true,
      hasChangedAuthor: true
    },
    vulnerabilities: [{}],
    versions: ["1.1.1", "1.5.0"]
  });
  const resultFlags = [...gen];
  tape.deepEqual(resultFlags, []);

  tape.end();
});
