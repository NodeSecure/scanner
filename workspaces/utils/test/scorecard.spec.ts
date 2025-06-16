// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import * as utils from "../src/scorecard.js";

describe("getScoreColor", () => {
  it("should return red", () => {
    assert.strictEqual(utils.getScoreColor(0), "red");
    assert.strictEqual(utils.getScoreColor(3), "red");
    assert.strictEqual(utils.getScoreColor(3.9), "red");
  });

  it("should return orange", () => {
    assert.strictEqual(utils.getScoreColor(4), "orange");
    assert.strictEqual(utils.getScoreColor(6.4), "orange");
  });

  it("should return blue", () => {
    assert.strictEqual(utils.getScoreColor(6.5), "blue");
    assert.strictEqual(utils.getScoreColor(8.4), "blue");
  });

  it("should return green", () => {
    assert.strictEqual(utils.getScoreColor(8.5), "green");
    assert.strictEqual(utils.getScoreColor(10), "green");
  });
});

describe("getVCSRepositoryPathAndPlatform", () => {
  it("should return null", () => {
    assert.strictEqual(utils.getVCSRepositoryPathAndPlatform(""), null);
    assert.strictEqual(utils.getVCSRepositoryPathAndPlatform(null as any), null);
    assert.strictEqual(utils.getVCSRepositoryPathAndPlatform(undefined as any), null);
  });

  it("should return path and platform", () => {
    assert.deepEqual(utils.getVCSRepositoryPathAndPlatform("http://github.com/foo/bar"), ["foo/bar", "github.com"]);
    assert.deepEqual(utils.getVCSRepositoryPathAndPlatform("https://github.com/foo/bar.git"), ["foo/bar", "github.com"]);
  });
});

