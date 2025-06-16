// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import * as utils from "../src/taggedString.js";

describe("taggedString", () => {
  it("with numeric parameter", () => {
    const clojureHello = utils.taggedString`Hello ${0}`;
    assert.strictEqual(clojureHello(), "Hello ");
    assert.strictEqual(clojureHello("world"), "Hello world");
  });

  it("with nammed parameter", () => {
    const clojureFoo = utils.taggedString`Hello ${"word"}`;
    assert.strictEqual(clojureFoo({}), "Hello ");
    assert.strictEqual(clojureFoo({ word: "bar" }), "Hello bar");
  });
});
