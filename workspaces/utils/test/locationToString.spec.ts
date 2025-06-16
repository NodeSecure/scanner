// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import * as utils from "../src/locationToString";

describe("locationToString", () => {
  it("should return the location array in string syntax", () => {
    const str = utils.locationToString([[1, 2], [2, 4]]);
    assert.equal(str, "[1:2] - [2:4]");
  });

  it("should ignore elements after length 1", () => {
    const str = utils.locationToString([[1, 2, 3], [2, 4, 10], [50]]);
    assert.equal(str, "[1:2] - [2:4]");
  });
});
