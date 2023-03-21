// Require Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { cleanRange } from "../../src/utils/index.js";

describe("cleanRange", () => {
  it("cleanRange should return cleaned SemVer range", () => {
    const r1 = cleanRange("0.1.0");
    const r2 = cleanRange("^1.0.0");
    const r3 = cleanRange(">=2.0.0");

    assert.strictEqual(r1, "0.1.0");
    assert.strictEqual(r2, "1.0.0");
    assert.strictEqual(r3, "2.0.0");
  });
});
