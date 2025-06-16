// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getFlags, getManifest } from "../src/index.js";

describe("getFlags()", () => {
  it("should return a Set with multiple flags", () => {
    const flags = getFlags();
    assert.equal(typeof flags, "object");
    assert.notStrictEqual(flags.size, 0);
  });

  it("should return a Set with only string primitive in it", () => {
    const flags = getFlags();
    const allFlagsAreString = [...flags].every((value) => typeof value === "string");
    assert.equal(allFlagsAreString, true);
  });

  it("should return the flags (title) from the Manifest", () => {
    const manifestFlags = getManifest();
    const equivalentArr = Object.values(manifestFlags).map((flagDescriptor) => flagDescriptor.title);
    const flags = getFlags();
    assert.deepEqual([...flags], equivalentArr);
  });
});
