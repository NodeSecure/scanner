// Require Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { addMissingVersionFlags } from "../../src/utils/index.js";

describe("addMissingVersionFlags", () => {
  it("addMissingVersionFlags should return all missing flags", () => {
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
    assert.deepEqual(resultFlags, [
      "isDead", "hasManyPublishers", "hasChangedAuthor", "hasVulnerabilities", "hasDuplicate"
    ]);
  });

  it("addMissingVersionFlags should return an empty array", () => {
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
    assert.deepEqual(resultFlags, []);
  });
});
