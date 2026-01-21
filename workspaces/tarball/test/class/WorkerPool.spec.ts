// Import Node.js Dependencies
import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import path from "node:path";

// Import Internal Dependencies
import { WorkerPool } from "../../dist/class/WorkerPool.class.js";

describe("WorkerPool.class.ts", () => {
  let pool: WorkerPool;

  before(() => {
    pool = WorkerPool.getInstance();
  });

  after(async() => {
    await pool.destroy();
  });

  it("should return singleton instance", () => {
    const pool1 = WorkerPool.getInstance();
    const pool2 = WorkerPool.getInstance();

    assert.strictEqual(pool1, pool2);
  });

  it("should analyze file using Worker Pool", async() => {
    const testFile = path.join(import.meta.dirname, "../test/fixtures/basic.js");

    const result = await pool.analyseFile(testFile, {
      fileOptions: { packageName: "test-package" }
    });

    assert.ok(result);
    assert.ok(typeof result === "object");
  });

  it("should handle concurrent file analysis", async() => {
    const testFile = path.join(import.meta.dirname, "../test/fixtures/basic.js");

    const promises = Array.from({ length: 10 }, () => pool.analyseFile(testFile, {
      fileOptions: { packageName: "test-package" }
    })
    );

    const results = await Promise.all(promises);

    assert.strictEqual(results.length, 10);
    results.forEach((result: any) => {
      assert.ok(result);
    });
  });

  it("should handle non-existent file gracefully", async() => {
    const testFile = "/non/existent/file.js";

    // js-x-ray returns ok:false for non-existent files, doesn't throw
    const result = await pool.analyseFile(testFile, {
      fileOptions: { packageName: "test-package" }
    });

    // Verify it returns a report (even if file doesn't exist)
    assert.ok(result);
    assert.strictEqual(result.ok, false);
  });

  it("should handle syntax errors in Worker gracefully", async() => {
    const testFile = path.join(import.meta.dirname, "../test/fixtures/invalid-syntax.js");

    // js-x-ray handles syntax errors internally
    const result = await pool.analyseFile(testFile, {
      fileOptions: { packageName: "test-package" }
    });

    // Should return a report with ok: false
    assert.ok(result);
    assert.strictEqual(result.ok, false);
  });
});
