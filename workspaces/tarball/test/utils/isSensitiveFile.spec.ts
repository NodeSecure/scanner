// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { isSensitiveFile } from "../../src/utils/index.ts";

test("isSensitiveFile should return true for sensitive files", () => {
  assert.ok(isSensitiveFile(".npmrc"));
  assert.ok(isSensitiveFile(".env"));
});

test("isSensitiveFile should return true for sensitive extensions", () => {
  assert.ok(isSensitiveFile("lol.key"), ".key extension is sensible");
  assert.ok(isSensitiveFile("bar.pem"), ".pem extension is sensible");
});

test("isSensitiveFile should return false for classical extension or file name", () => {
  assert.ok(!isSensitiveFile("test.js"));
  assert.ok(!isSensitiveFile(".eslintrc"));
});
