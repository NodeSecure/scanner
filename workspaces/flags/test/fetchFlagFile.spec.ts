// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getFlags, lazyFetchFlagFile } from "../src/index.ts";

describe("lazyFetchFlagFile()", () => {
  it("should throw an Error if no flag name is provided", () => {
    assert.throws(() => lazyFetchFlagFile(null as unknown as string), {
      name: "TypeError",
      message: "You should provide a flag name"
    });
  });

  it("should throw an Error if provided flags doesn't exist", () => {
    assert.throws(() => lazyFetchFlagFile("wrongFlagName"), {
      name: "Error",
      message: "There is no file associated with that name"
    });
  });

  it("should return a ReadableStream and every flags should have a valid html file", () => {
    for (const flag of getFlags()) {
      const rStream = lazyFetchFlagFile(flag);
      assert.strictEqual(typeof rStream[Symbol.asyncIterator], "function");
    }
  });
});
