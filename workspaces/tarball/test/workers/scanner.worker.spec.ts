// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Internal Dependencies
import analyzeBatch from "../../src/workers/scanner.worker.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("scanner.worker.ts", () => {
  it("should analyze file batch successfully", async() => {
    const testFile = path.join(__dirname, "../fixtures/basic.js");

    const results = await analyzeBatch({
      files: [testFile],
      options: {
        fileOptions: { packageName: "test-package" }
      }
    });

    assert.ok(Array.isArray(results));
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].s, true);
    assert.ok(results[0].r);
    assert.strictEqual(results[0].file, testFile);
  });

  it("should handle file not found error in batch", async() => {
    const testFile = "/non/existent/file.js";

    const results = await analyzeBatch({
      files: [testFile],
      options: {
        fileOptions: { packageName: "test-package" }
      }
    });

    assert.ok(Array.isArray(results));
    assert.strictEqual(results[0].s, true);
    assert.strictEqual(results[0].r?.ok, false);
    assert.ok(results[0].e === undefined || results[0].e === null);
  });

  it("should handle syntax errors gracefully in batch", async() => {
    const testFile = path.join(__dirname, "../fixtures/invalid-syntax.js");

    const results = await analyzeBatch({
      files: [testFile],
      options: {
        fileOptions: { packageName: "test-package" }
      }
    });

    assert.ok(Array.isArray(results));
    assert.strictEqual(results[0].s, true);
    assert.strictEqual(results[0].r?.ok, false);
  });

  it("should process multiple files in a single batch", async() => {
    const testFile1 = path.join(__dirname, "../fixtures/basic.js");
    const testFile2 = path.join(__dirname, "../fixtures/basic.js");

    const results = await analyzeBatch({
      files: [testFile1, testFile2],
      options: {
        fileOptions: { packageName: "test-package" }
      }
    });

    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].file, testFile1);
    assert.strictEqual(results[1].file, testFile2);
    assert.strictEqual(results[0].s, true);
    assert.strictEqual(results[1].s, true);
  });
});
