// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { addMissingVersionFlags } from "../../src/utils/index.ts";

describe("utils.addMissingVersionFlags", () => {
  it("should return all missing flags", () => {
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
    } as any);
    const resultFlags = [...gen];
    assert.deepEqual(resultFlags, [
      "isDead", "hasManyPublishers", "hasChangedAuthor", "hasVulnerabilities", "hasDuplicate"
    ]);
  });

  it("should return an empty array", () => {
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
    } as any);
    const resultFlags = [...gen];
    assert.deepEqual(resultFlags, []);
  });
});
