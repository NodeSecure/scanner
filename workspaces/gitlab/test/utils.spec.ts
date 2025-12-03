// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getRepositoryPath } from "../src/utils.ts";

describe("getRepositoryPath", () => {
  test("must return id", () => {
    assert.strictEqual(getRepositoryPath("10"), "10");
  });

  test("must return GitLab path (encoded for URL)", () => {
    assert.strictEqual(getRepositoryPath("nodesecure.boo"), "nodesecure%2Fboo");
  });
});
