// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { getUsedDeps } from "../../src/utils/index.ts";

describe("utils.getUsedDeps", () => {
  it("should handle scoped packages", () => {
    const deps = getUsedDeps(new Set([
      "@slimio/is@latest"
    ]));

    assert.deepStrictEqual(deps, [["@slimio/is", "latest"]]);
  });

  it("should handle non-scoped packages", () => {
    const deps = getUsedDeps(new Set([
      "is@latest"
    ]));

    assert.deepStrictEqual(deps, [["is", "latest"]]);
  });
});
