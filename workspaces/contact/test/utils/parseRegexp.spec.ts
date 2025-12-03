// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { parseRegExp } from "../../src/utils/index.ts";

describe("parseRegExp", () => {
  test("Given a literal with no slash then it must return null", () => {
    assert.strictEqual(
      parseRegExp("hello"),
      null
    );
  });

  test("Given a literal with a valid RegExp in it then it must return a RegExp", () => {
    const regexp = parseRegExp("/^hello/i");

    assert.ok(regexp instanceof RegExp);
    assert.ok(
      regexp.test("Hello World")
    );
  });
});
