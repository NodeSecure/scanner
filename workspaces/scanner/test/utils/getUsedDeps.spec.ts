// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getUsedDeps } from "../../src/utils/index.js";

test("getUsedDeps should handle scoped packages", () => {
  const deps = getUsedDeps(new Set([
    "@slimio/is@latest"
  ]));

  assert.deepStrictEqual(deps, [["@slimio/is", "latest"]]);
});

test("getUsedDeps should handle non-scoped packages", () => {
  const deps = getUsedDeps(new Set([
    "is@latest"
  ]));

  assert.deepStrictEqual(deps, [["is", "latest"]]);
});
