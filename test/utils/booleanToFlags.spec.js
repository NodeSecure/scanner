// Require Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { booleanToFlags } from "../../src/utils/index.js";

describe("booleanToFlags", () => {
  it("booleanToFlags should transform the Record in flag list where value are true", () => {
    const flags = booleanToFlags({ hasScript: true, foo: false, bar: true });
    assert.deepEqual([...flags], ["hasScript", "bar"]);
  });
});
