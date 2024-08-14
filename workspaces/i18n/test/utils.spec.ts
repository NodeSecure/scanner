// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { taggedString } from "../src/utils.js";

test("taggedString", () => {
  const clojureHello = taggedString`Hello ${0}`;
  assert.strictEqual(clojureHello(), "Hello ");
  assert.strictEqual(clojureHello("world"), "Hello world");

  const clojureFoo = taggedString`Hello ${"word"}`;
  assert.strictEqual(clojureFoo({ word: "bar" }), "Hello bar");
});
