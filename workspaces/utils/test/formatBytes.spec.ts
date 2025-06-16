// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import * as utils from "../src/formatBytes";

describe("formatBytes", () => {
  it("should return '0 B' if bytes argument is equal zero", () => {
    assert.equal(utils.formatBytes(0), "0 B");
  });

  it("should format 10 bytes", () => {
    assert.equal(utils.formatBytes(10), "10 B");
  });

  it("should format 3000 bytes in KB with two fixed number", () => {
    assert.equal(utils.formatBytes(3000), "2.93 KB");
  });

  it("should format 822_223_900 bytes in MB", () => {
    assert.equal(utils.formatBytes(822_223_900), "784.13 MB");
  });
});
